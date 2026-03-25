import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  type UserRole = {
    #siteEngineer;
    #chiefEngineer;
    #materialsEngineer;
    #siteOwner;
  };

  type User = {
    name : Text;
    email : Text;
    hashedPassword : Text;
    role : UserRole;
  };

  type Task = {
    title : Text;
    description : Text;
    assignedTo : Principal;
    status : Text;
  };

  type DailyLogEntry = {
    date : Nat;
    content : Text;
  };

  type Material = {
    name : Text;
    quantity : Nat;
    reorderLevel : Nat;
  };

  type Project = {
    name : Text;
    site : Text;
    status : Text;
    budget : Nat;
  };

  type MaterialRequest = {
    materialName : Text;
    quantity : Nat;
    approved : Bool;
  };

  type DashboardSummary = {
    projects : [Project];
    attendanceSummary : Nat;
    financialOverview : Nat;
    teamList : [User];
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let users = Map.empty<Principal, User>();
  let materials = Map.empty<Nat, Material>();
  let projects = Map.empty<Nat, Project>();
  let tasks = Map.empty<Nat, Task>();
  var nextMaterialId = 0;
  var nextProjectId = 0;
  var nextTaskId = 0;

  // Helper function to get user role
  private func getUserRole(principal : Principal) : ?UserRole {
    switch (users.get(principal)) {
      case (null) { null };
      case (?user) { ?user.role };
    };
  };

  // Helper function to check if caller has specific role
  private func hasRole(caller : Principal, requiredRole : UserRole) : Bool {
    switch (getUserRole(caller)) {
      case (null) { false };
      case (?role) { role == requiredRole };
    };
  };

  public shared ({ caller }) func registerUser(name : Text, email : Text, password : Text, role : UserRole) : async () {
    // Only admins can create users with elevated roles (non-SiteEngineer)
    if (role != #siteEngineer) {
      if (not (AccessControl.isAdmin(accessControlState, caller))) {
        Runtime.trap("Unauthorized: Only admins can create users with elevated roles");
      };
    };

    // Prevent anonymous registration
    if (caller.isAnonymous()) {
      Runtime.trap("Cannot register anonymous users. Authenticate first!");
    };

    // TODO: hash password, once build system is updated to support it!
    let hashedPassword = password;
    let user : User = { name; email; hashedPassword; role };
    users.add(caller, user);

    // Assign user role in AccessControl system
    AccessControl.assignRole(accessControlState, caller, caller, #user);
  };

  public shared ({ caller }) func loginUser(email : Text, password : Text) : async () {
    let authenticatedUser = users.values().find(func(user) { user.email == email });
    switch (authenticatedUser) {
      case (null) {
        Runtime.trap("Login failed: User does not exist. Verify credentials or reach out to responsible administrator for an account");
      };
      case (?user) {
        // TODO: hash password, once build system is updated to support it!
        let hashedPassword = password;
        if (user.hashedPassword != hashedPassword) {
          Runtime.trap("Login failed: Incorrect password. Please try again");
        };
        ();
      };
    };
  };

  public shared ({ caller }) func getCurrentUserProfile() : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can access their profile");
    };

    switch (users.get(caller)) {
      case (null) {
        Runtime.trap("Not found: User does not exist. Please register first");
      };
      case (?user) { user };
    };
  };

  public shared ({ caller }) func submitDailyLog(date : Nat, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can submit daily logs");
    };

    // Only SiteEngineers can submit daily logs
    if (not hasRole(caller, #siteEngineer)) {
      Runtime.trap("Unauthorized: Only Site Engineers can submit daily logs");
    };

    switch (users.get(caller)) {
      case (null) {
        Runtime.trap("Not found: User does not exist. Please register first");
      };
      case (?user) {
        let dailyLogEntry : DailyLogEntry = {
          date;
          content;
        };
        // In a real implementation, store this log entry
        ();
      };
    };
  };

  public query ({ caller }) func getInventory() : async [Material] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can access inventory");
    };

    // Only MaterialsEngineers can view inventory
    if (not hasRole(caller, #materialsEngineer)) {
      Runtime.trap("Unauthorized: Only Materials Engineers can access inventory");
    };

    materials.values().toArray();
  };

  public shared ({ caller }) func updateStock(materialId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can update stock");
    };

    // Only MaterialsEngineers can update stock
    if (not hasRole(caller, #materialsEngineer)) {
      Runtime.trap("Unauthorized: Only Materials Engineers can update stock levels");
    };

    switch (materials.get(materialId)) {
      case (null) {
        Runtime.trap("Not found: Material does not exist. Please contact administrator");
      };
      case (?material) {
        let updatedMaterial = { material with quantity };
        materials.add(materialId, updatedMaterial);
      };
    };
  };

  public shared ({ caller }) func createReorderAlert(materialId : Nat, reorderLevel : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can create reorder alerts");
    };

    // Only MaterialsEngineers can create reorder alerts
    if (not hasRole(caller, #materialsEngineer)) {
      Runtime.trap("Unauthorized: Only Materials Engineers can create reorder alerts");
    };

    switch (materials.get(materialId)) {
      case (null) {
        Runtime.trap("Not found: Material does not exist. Please contact administrator");
      };
      case (?material) {
        let updatedMaterial = { material with reorderLevel };
        materials.add(materialId, updatedMaterial);
      };
    };
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, User)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access the list of all users");
    };
    users.toArray();
  };

  public query ({ caller }) func getSiteEngineerTasks(siteEngineer : Principal) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can access tasks");
    };

    // Users can only view their own tasks unless they are admin
    if (caller != siteEngineer and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own tasks");
    };

    tasks.values().filter(func(task) { task.assignedTo == siteEngineer }).toArray();
  };

  public query ({ caller }) func getFullDashboardSummary() : async DashboardSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can access dashboard");
    };

    // Only SiteOwners can view full dashboard
    if (not hasRole(caller, #siteOwner)) {
      Runtime.trap("Unauthorized: Only Site Owners can access the full dashboard summary");
    };

    let projectList = projects.values().toArray();
    let teamList = users.values().toArray();

    {
      projects = projectList;
      attendanceSummary = 0;
      financialOverview = 0;
      teamList;
    };
  };

  public shared ({ caller }) func approveMaterialRequest(materialName : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can approve material requests");
    };

    // Only ChiefEngineers can approve material requests
    if (not hasRole(caller, #chiefEngineer)) {
      Runtime.trap("Unauthorized: Only Chief Engineers can approve material requests");
    };

    let materialRequest : MaterialRequest = { materialName; quantity; approved = true };
    // In a real implementation, store this approval
    ();
  };

  public query ({ caller }) func getProjectOverview() : async [Project] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can access project overview");
    };

    // Only ChiefEngineers can view project overview
    if (not hasRole(caller, #chiefEngineer)) {
      Runtime.trap("Unauthorized: Only Chief Engineers can access the project overview");
    };

    projects.values().toArray();
  };

  public shared ({ caller }) func addMaterial(name : Text, quantity : Nat, reorderLevel : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can add materials");
    };

    // Only MaterialsEngineers and admins can add materials
    if (not hasRole(caller, #materialsEngineer) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only Materials Engineers can add materials");
    };

    let materialId = nextMaterialId;
    let material : Material = { name; quantity; reorderLevel };
    materials.add(materialId, material);
    nextMaterialId += 1;
    materialId;
  };

  public shared ({ caller }) func addProject(name : Text, site : Text, status : Text, budget : Nat) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add projects");
    };
    let projectId = nextProjectId;
    let project : Project = { name; site; status; budget };
    projects.add(projectId, project);
    nextProjectId += 1;
    projectId;
  };

  public shared ({ caller }) func assignTask(title : Text, description : Text, assignedTo : Principal, status : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can assign tasks");
    };

    // Only ChiefEngineers and admins can assign tasks
    if (not hasRole(caller, #chiefEngineer) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only Chief Engineers can assign tasks");
    };

    let taskId = nextTaskId;
    let task : Task = { title; description; assignedTo; status };
    tasks.add(taskId, task);
    nextTaskId += 1;
    taskId;
  };
};
