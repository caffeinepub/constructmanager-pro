import Nat "mo:core/Nat";
import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Outcall "http-outcalls/outcall";

actor {
  // ─── TYPES ───────────────────────────────────────────────────────────────

  type AppRole = { #chiefEngineer; #siteEngineer; #materialsEngineer; #siteOwner };

  type UserProfile = {
    email       : Text;
    name        : Text;
    pwHash      : Text;
    nationality : Text;
    currency    : Text;
    phone       : Text;
    role        : AppRole;
  };

  type Project = {
    id         : Nat;
    name       : Text;
    location   : Text;
    startDate  : Text;
    teamCode   : Text;
    pwHash     : Text;
    completion : Nat;
    budget     : Nat;
    createdBy  : Text;
  };

  type ProjectMember = {
    projectId : Nat;
    email     : Text;
    role      : AppRole;
  };

  type Worker = {
    id        : Nat;
    projectId : Nat;
    name      : Text;
    skill     : Text;
    dailyWage : Nat;
    phone     : Text;
    wEmail    : Text;
    dialCode  : Text;
  };

  type AttendanceRecord = {
    workerId  : Nat;
    projectId : Nat;
    date      : Text;
    status    : Text;
  };

  type Material = {
    id           : Nat;
    projectId    : Nat;
    name         : Text;
    unit         : Text;
    stock        : Nat;
    reorderLevel : Nat;
    priceUsd     : Nat;
    supplier     : Text;
  };

  type MaterialTx = {
    id         : Nat;
    materialId : Nat;
    projectId  : Nat;
    txType     : Text;
    qty        : Nat;
    date       : Text;
    byEmail    : Text;
    notes      : Text;
  };

  type ProgressEntry = {
    id        : Nat;
    projectId : Nat;
    pct       : Nat;
    notes     : Text;
    date      : Text;
    byEmail   : Text;
    photos    : [Text];
  };

  type PayrollRecord = {
    id          : Nat;
    projectId   : Nat;
    period      : Text;
    totalAmount : Nat;
    status      : Text;
    submittedBy : Text;
    approvedBy  : Text;
  };

  type ChatMessage = {
    id            : Nat;
    projectId     : Nat;
    senderEmail   : Text;
    senderName    : Text;
    senderRole    : Text;
    receiverEmail : Text;
    isDM          : Bool;
    text          : Text;
    timestamp     : Text;
  };

  type Notification = {
    id        : Nat;
    userEmail : Text;
    nType     : Text;
    content   : Text;
    isRead    : Bool;
    timestamp : Text;
  };

  type AuditEntry = {
    id        : Nat;
    userEmail : Text;
    action    : Text;
    area      : Text;
    details   : Text;
    timestamp : Text;
  };

  // ─── MIGRATION: old stable variables from previous version ──────────────
  type _OldUserRole = { #siteEngineer; #chiefEngineer; #materialsEngineer; #siteOwner };
  type _OldUser = { name : Text; email : Text; hashedPassword : Text; role : _OldUserRole };
  type _OldMaterial = { name : Text; quantity : Nat; reorderLevel : Nat };
  type _OldProject = { name : Text; site : Text; status : Text; budget : Nat };
  type _OldTask = { title : Text; description : Text; assignedTo : Principal; status : Text };

  var users         = Map.empty<Principal, _OldUser>();
  var materials     = Map.empty<Nat, _OldMaterial>();
  var projects      = Map.empty<Nat, _OldProject>();
  var tasks         = Map.empty<Nat, _OldTask>();
  var nextMaterialId : Nat = 0;
  var nextProjectId  : Nat = 0;
  var nextTaskId     : Nat = 0;

  // ─── STATE ───────────────────────────────────────────────────────────────

  stable var userList       : List.List<UserProfile>      = List.empty();
  stable var projectList    : List.List<Project>          = List.empty();
  stable var memberList     : List.List<ProjectMember>    = List.empty();
  stable var workerList     : List.List<Worker>           = List.empty();
  stable var attendanceList : List.List<AttendanceRecord> = List.empty();
  stable var materialList   : List.List<Material>         = List.empty();
  stable var txList         : List.List<MaterialTx>       = List.empty();
  stable var progressList   : List.List<ProgressEntry>    = List.empty();
  stable var payrollList    : List.List<PayrollRecord>    = List.empty();
  stable var chatList       : List.List<ChatMessage>      = List.empty();
  stable var notifList      : List.List<Notification>     = List.empty();
  stable var auditList      : List.List<AuditEntry>       = List.empty();

  stable var nextProjId   : Nat = 1;
  stable var nextWrkId    : Nat = 1;
  stable var nextMatId    : Nat = 1;
  stable var nextTxId     : Nat = 1;
  stable var nextProgId   : Nat = 1;
  stable var nextPayId    : Nat = 1;
  stable var nextChatId   : Nat = 1;
  stable var nextNotifId  : Nat = 1;
  stable var nextAuditId  : Nat = 1;

  // ─── EXCHANGE RATE CACHE ─────────────────────────────────────────────────
  // Cached JSON string from open.er-api.com, refreshed at most once per hour
  stable var cachedRatesJson    : Text = "";
  stable var ratesCachedAt      : Int  = 0;  // nanoseconds from Time.now()
  let ONE_HOUR_NS : Int = 3_600_000_000_000;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  func findUser(email : Text) : ?UserProfile {
    userList.find(func(u : UserProfile) : Bool { u.email == email })
  };

  func isMember(projectId : Nat, email : Text) : Bool {
    memberList.any(func(m : ProjectMember) : Bool { m.projectId == projectId and m.email == email })
  };

  func getRole(projectId : Nat, email : Text) : ?AppRole {
    switch (memberList.find(func(m : ProjectMember) : Bool { m.projectId == projectId and m.email == email })) {
      case (?m) { ?m.role };
      case null  { null };
    }
  };

  func audit(email : Text, action : Text, area : Text, details : Text, ts : Text) {
    auditList.add({ id = nextAuditId; userEmail = email; action; area; details; timestamp = ts });
    nextAuditId += 1;
  };

  func notif(email : Text, nType : Text, content : Text, ts : Text) {
    notifList.add({ id = nextNotifId; userEmail = email; nType; content; isRead = false; timestamp = ts });
    nextNotifId += 1;
  };

  func roleText(r : AppRole) : Text {
    switch (r) {
      case (#chiefEngineer)    { "chiefEngineer" };
      case (#siteEngineer)     { "siteEngineer" };
      case (#materialsEngineer){ "materialsEngineer" };
      case (#siteOwner)        { "siteOwner" };
    }
  };

  // ─── EXCHANGE RATES (HTTP OUTCALL) ────────────────────────────────────────

  // Returns latest USD-base exchange rates as a JSON string.
  // Uses open.er-api.com (free, no key needed).
  // Result is cached for 1 hour to avoid excessive cycles spend.
  public func getExchangeRates() : async { ok : Bool; json : Text } {
    let now = Time.now();
    if (cachedRatesJson != "" and (now - ratesCachedAt) < ONE_HOUR_NS) {
      return { ok = true; json = cachedRatesJson };
    };
    try {
      let url = "https://open.er-api.com/v6/latest/USD";
      let json = await Outcall.httpGetRequest(url, [], transform);
      cachedRatesJson := json;
      ratesCachedAt   := now;
      { ok = true; json }
    } catch (_) {
      // Return cached value (even if stale) or empty on first failure
      if (cachedRatesJson != "") {
        { ok = true; json = cachedRatesJson }
      } else {
        { ok = false; json = "{}" }
      }
    }
  };

  public query func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    { input.response with headers = [] }
  };

  // ─── AUTH ─────────────────────────────────────────────────────────────────

  public func register(
    email : Text, name : Text, password : Text,
    nationality : Text, currency : Text, phone : Text, role : AppRole
  ) : async { ok : Bool; message : Text } {
    if (findUser(email) != null) {
      return { ok = false; message = "Email already registered" };
    };
    userList.add({ email; name; pwHash = password; nationality; currency; phone; role });
    { ok = true; message = "Registration successful" }
  };

  public func login(email : Text, password : Text)
    : async { ok : Bool; message : Text; role : Text; name : Text; nationality : Text; currency : Text; phone : Text } {
    switch (findUser(email)) {
      case null { { ok = false; message = "User not found"; role = ""; name = ""; nationality = ""; currency = ""; phone = "" } };
      case (?u) {
        if (u.pwHash != password) {
          return { ok = false; message = "Incorrect password"; role = ""; name = ""; nationality = ""; currency = ""; phone = "" };
        };
        { ok = true; message = "OK"; role = roleText(u.role); name = u.name; nationality = u.nationality; currency = u.currency; phone = u.phone }
      };
    }
  };

  public func updateProfile(
    email : Text, password : Text, name : Text, nationality : Text, currency : Text, phone : Text
  ) : async { ok : Bool; message : Text } {
    switch (findUser(email)) {
      case null { { ok = false; message = "User not found" } };
      case (?u) {
        if (u.pwHash != password) { return { ok = false; message = "Incorrect password" } };
        let updated : UserProfile = { email; name; pwHash = password; nationality; currency; phone; role = u.role };
        userList.mapInPlace(func(x : UserProfile) : UserProfile { if (x.email == email) updated else x });
        { ok = true; message = "Profile updated" }
      };
    }
  };

  public func changePassword(email : Text, oldPw : Text, newPw : Text) : async { ok : Bool; message : Text } {
    switch (findUser(email)) {
      case null { { ok = false; message = "User not found" } };
      case (?u) {
        if (u.pwHash != oldPw) { return { ok = false; message = "Incorrect current password" } };
        userList.mapInPlace(func(x : UserProfile) : UserProfile {
          if (x.email == email) { { x with pwHash = newPw } } else x
        });
        { ok = true; message = "Password changed" }
      };
    }
  };

  // ─── PROJECTS ─────────────────────────────────────────────────────────────

  public func createProject(
    creatorEmail : Text, name : Text, location : Text,
    startDate : Text, teamCode : Text, teamPassword : Text, budget : Nat, ts : Text
  ) : async { ok : Bool; message : Text; projectId : Nat } {
    switch (findUser(creatorEmail)) {
      case null { return { ok = false; message = "User not found"; projectId = 0 } };
      case (?u) {
        if (u.role != #chiefEngineer) {
          return { ok = false; message = "Only Chief Engineers can create projects"; projectId = 0 };
        };
      };
    };
    if (projectList.any(func(p : Project) : Bool { p.teamCode == teamCode })) {
      return { ok = false; message = "Team code already in use"; projectId = 0 };
    };
    let pid = nextProjId;
    projectList.add({ id = pid; name; location; startDate; teamCode; pwHash = teamPassword; completion = 0; budget; createdBy = creatorEmail });
    nextProjId += 1;
    memberList.add({ projectId = pid; email = creatorEmail; role = #chiefEngineer });
    audit(creatorEmail, "Create Project", "Projects", name, ts);
    { ok = true; message = "Project created"; projectId = pid }
  };

  public func joinProject(
    email : Text, teamCode : Text, teamPassword : Text, role : AppRole
  ) : async { ok : Bool; message : Text; projectId : Nat } {
    if (findUser(email) == null) {
      return { ok = false; message = "User not found"; projectId = 0 };
    };
    switch (projectList.find(func(p : Project) : Bool { p.teamCode == teamCode })) {
      case null { { ok = false; message = "Invalid team code"; projectId = 0 } };
      case (?proj) {
        if (proj.pwHash != teamPassword) {
          return { ok = false; message = "Wrong team password"; projectId = 0 };
        };
        if (isMember(proj.id, email)) {
          return { ok = true; message = "Already a member"; projectId = proj.id };
        };
        memberList.add({ projectId = proj.id; email; role });
        { ok = true; message = "Joined project"; projectId = proj.id }
      };
    }
  };

  public func verifyProjectPassword(email : Text, projectId : Nat, teamPassword : Text)
    : async { ok : Bool; message : Text } {
    if (not isMember(projectId, email)) {
      return { ok = false; message = "Not a member" };
    };
    switch (projectList.find(func(p : Project) : Bool { p.id == projectId })) {
      case null { { ok = false; message = "Project not found" } };
      case (?proj) {
        if (proj.pwHash == teamPassword) { { ok = true; message = "OK" } }
        else { { ok = false; message = "Wrong team password" } }
      };
    }
  };

  public query func getUserProjects(email : Text) : async [Project] {
    let myIds = memberList.filter(func(m : ProjectMember) : Bool { m.email == email })
      .map<ProjectMember, Nat>(func(m : ProjectMember) : Nat { m.projectId });
    projectList.filter(func(p : Project) : Bool {
      myIds.any(func(id : Nat) : Bool { id == p.id })
    }).toArray()
  };

  public query func getAllProjects() : async [Project] {
    projectList.toArray()
  };

  public query func getProjectMembers(projectId : Nat) : async [ProjectMember] {
    memberList.filter(func(m : ProjectMember) : Bool { m.projectId == projectId }).toArray()
  };

  public func updateTeamCode(
    email : Text, projectId : Nat, newCode : Text, newPassword : Text
  ) : async { ok : Bool; message : Text } {
    switch (getRole(projectId, email)) {
      case (?#chiefEngineer) {};
      case _ { return { ok = false; message = "Only Chief Engineer can change code/password" } };
    };
    if (projectList.any(func(p : Project) : Bool { p.teamCode == newCode and p.id != projectId })) {
      return { ok = false; message = "Team code already in use" };
    };
    projectList.mapInPlace(func(p : Project) : Project {
      if (p.id == projectId) { { p with teamCode = newCode; pwHash = newPassword } } else p
    });
    { ok = true; message = "Team code and password updated" }
  };

  // ─── WORKERS ──────────────────────────────────────────────────────────────

  public func addWorker(
    email : Text, projectId : Nat,
    name : Text, skill : Text, dailyWage : Nat, phone : Text, wEmail : Text, dialCode : Text, ts : Text
  ) : async { ok : Bool; message : Text; workerId : Nat } {
    switch (getRole(projectId, email)) {
      case (?#siteEngineer) {};
      case (?#chiefEngineer) {};
      case _ { return { ok = false; message = "Only Site/Chief Engineers can add workers"; workerId = 0 } };
    };
    let wid = nextWrkId;
    workerList.add({ id = wid; projectId; name; skill; dailyWage; phone; wEmail; dialCode });
    nextWrkId += 1;
    audit(email, "Add Worker", "Labour", name, ts);
    { ok = true; message = "Worker added"; workerId = wid }
  };

  public func updateWorker(
    email : Text, projectId : Nat, workerId : Nat,
    name : Text, skill : Text, dailyWage : Nat, phone : Text, wEmail : Text, dialCode : Text
  ) : async { ok : Bool; message : Text } {
    switch (getRole(projectId, email)) {
      case (?#siteEngineer) {};
      case (?#chiefEngineer) {};
      case _ { return { ok = false; message = "Only Site/Chief Engineers can edit workers" } };
    };
    workerList.mapInPlace(func(w : Worker) : Worker {
      if (w.id == workerId and w.projectId == projectId) {
        { w with name; skill; dailyWage; phone; wEmail; dialCode }
      } else w
    });
    { ok = true; message = "Worker updated" }
  };

  public query func getWorkers(projectId : Nat) : async [Worker] {
    workerList.filter(func(w : Worker) : Bool { w.projectId == projectId }).toArray()
  };

  // ─── ATTENDANCE ───────────────────────────────────────────────────────────

  public func markAttendance(
    email : Text, projectId : Nat, workerId : Nat, date : Text, status : Text
  ) : async { ok : Bool; message : Text } {
    switch (getRole(projectId, email)) {
      case (?#siteEngineer) {};
      case (?#chiefEngineer) {};
      case _ { return { ok = false; message = "Only Site/Chief Engineers can mark attendance" } };
    };
    attendanceList.retain(func(a : AttendanceRecord) : Bool {
      not (a.workerId == workerId and a.date == date)
    });
    attendanceList.add({ workerId; projectId; date; status });
    { ok = true; message = "Attendance marked" }
  };

  public query func getAttendance(projectId : Nat) : async [AttendanceRecord] {
    attendanceList.filter(func(a : AttendanceRecord) : Bool { a.projectId == projectId }).toArray()
  };

  // ─── PAYROLL ──────────────────────────────────────────────────────────────

  public func submitPayroll(
    email : Text, projectId : Nat, period : Text, totalAmount : Nat, ts : Text
  ) : async { ok : Bool; message : Text; payrollId : Nat } {
    switch (getRole(projectId, email)) {
      case (?#siteEngineer) {};
      case (?#chiefEngineer) {};
      case _ { return { ok = false; message = "Only Site/Chief Engineers can submit payroll"; payrollId = 0 } };
    };
    let pid = nextPayId;
    payrollList.add({ id = pid; projectId; period; totalAmount; status = "pending"; submittedBy = email; approvedBy = "" });
    nextPayId += 1;
    audit(email, "Submit Payroll", "Labour", period, ts);
    memberList.filter(func(m : ProjectMember) : Bool { m.projectId == projectId and m.role == #chiefEngineer })
      .forEach(func(m : ProjectMember) {
        notif(m.email, "payroll", "Payroll submitted for " # period, ts)
      });
    { ok = true; message = "Payroll submitted"; payrollId = pid }
  };

  public func approvePayroll(
    email : Text, projectId : Nat, payrollId : Nat, ts : Text
  ) : async { ok : Bool; message : Text } {
    switch (getRole(projectId, email)) {
      case (?#chiefEngineer) {};
      case _ { return { ok = false; message = "Only Chief Engineers can approve payroll" } };
    };
    payrollList.mapInPlace(func(p : PayrollRecord) : PayrollRecord {
      if (p.id == payrollId and p.projectId == projectId) {
        { p with status = "approved"; approvedBy = email }
      } else p
    });
    audit(email, "Approve Payroll", "Labour", payrollId.toText(), ts);
    { ok = true; message = "Payroll approved" }
  };

  public query func getPayroll(projectId : Nat) : async [PayrollRecord] {
    payrollList.filter(func(p : PayrollRecord) : Bool { p.projectId == projectId }).toArray()
  };

  // ─── MATERIALS ────────────────────────────────────────────────────────────

  public func addMaterial(
    email : Text, projectId : Nat,
    name : Text, unit : Text, stock : Nat, reorderLevel : Nat, priceUsd : Nat, supplier : Text, ts : Text
  ) : async { ok : Bool; message : Text; materialId : Nat } {
    switch (getRole(projectId, email)) {
      case (?#materialsEngineer) {};
      case (?#chiefEngineer) {};
      case _ { return { ok = false; message = "Only Materials/Chief Engineers can add materials"; materialId = 0 } };
    };
    let mid = nextMatId;
    materialList.add({ id = mid; projectId; name; unit; stock; reorderLevel; priceUsd; supplier });
    nextMatId += 1;
    audit(email, "Add Material", "Materials", name, ts);
    { ok = true; message = "Material added"; materialId = mid }
  };

  public func updateMaterial(
    email : Text, projectId : Nat, materialId : Nat,
    name : Text, unit : Text, stock : Nat, reorderLevel : Nat, priceUsd : Nat, supplier : Text
  ) : async { ok : Bool; message : Text } {
    switch (getRole(projectId, email)) {
      case (?#materialsEngineer) {};
      case (?#chiefEngineer) {};
      case _ { return { ok = false; message = "Only Materials/Chief Engineers can edit materials" } };
    };
    materialList.mapInPlace(func(m : Material) : Material {
      if (m.id == materialId and m.projectId == projectId) {
        { m with name; unit; stock; reorderLevel; priceUsd; supplier }
      } else m
    });
    { ok = true; message = "Material updated" }
  };

  public func recordTx(
    email : Text, projectId : Nat, materialId : Nat,
    txType : Text, qty : Nat, date : Text, notes : Text, ts : Text
  ) : async { ok : Bool; message : Text } {
    switch (getRole(projectId, email)) {
      case (?#materialsEngineer) {};
      case (?#chiefEngineer) {};
      case _ { return { ok = false; message = "Only Materials/Chief Engineers can record transactions" } };
    };
    var lowStock = false;
    var matName = "";
    materialList.mapInPlace(func(m : Material) : Material {
      if (m.id == materialId and m.projectId == projectId) {
        let newStock = if (txType == "inward") { m.stock + qty }
                       else if (m.stock >= qty) { m.stock - qty } else { 0 };
        if (newStock <= m.reorderLevel) {
          lowStock := true;
          matName := m.name;
        };
        { m with stock = newStock }
      } else m
    });
    if (lowStock) {
      memberList.filter(func(m : ProjectMember) : Bool {
        m.projectId == projectId and (m.role == #materialsEngineer or m.role == #chiefEngineer)
      }).forEach(func(m : ProjectMember) {
        notif(m.email, "lowstock", matName # " is running low", ts)
      });
    };
    txList.add({ id = nextTxId; materialId; projectId; txType; qty; date; byEmail = email; notes });
    nextTxId += 1;
    { ok = true; message = "Transaction recorded" }
  };

  public query func getMaterials(projectId : Nat) : async [Material] {
    materialList.filter(func(m : Material) : Bool { m.projectId == projectId }).toArray()
  };

  public query func getMaterialTx(projectId : Nat) : async [MaterialTx] {
    txList.filter(func(t : MaterialTx) : Bool { t.projectId == projectId }).toArray()
  };

  // ─── PROGRESS ─────────────────────────────────────────────────────────────

  public func addProgress(
    email : Text, projectId : Nat,
    pct : Nat, notes : Text, date : Text, photos : [Text], ts : Text
  ) : async { ok : Bool; message : Text; entryId : Nat } {
    switch (getRole(projectId, email)) {
      case (?#siteEngineer) {};
      case (?#chiefEngineer) {};
      case _ { return { ok = false; message = "Only Site/Chief Engineers can update progress"; entryId = 0 } };
    };
    let eid = nextProgId;
    progressList.add({ id = eid; projectId; pct; notes; date; byEmail = email; photos });
    nextProgId += 1;
    projectList.mapInPlace(func(p : Project) : Project {
      if (p.id == projectId) { { p with completion = pct } } else p
    });
    audit(email, "Update Progress", "Progress", pct.toText() # "%", ts);
    { ok = true; message = "Progress added"; entryId = eid }
  };

  public query func getProgress(projectId : Nat) : async [ProgressEntry] {
    progressList.filter(func(e : ProgressEntry) : Bool { e.projectId == projectId }).toArray()
  };

  // ─── CHAT ─────────────────────────────────────────────────────────────────

  public func postChat(
    projectId : Nat, senderEmail : Text, senderName : Text, senderRole : Text,
    text : Text, timestamp : Text, isDM : Bool, receiverEmail : Text
  ) : async { ok : Bool; messageId : Nat } {
    if (not isMember(projectId, senderEmail)) {
      return { ok = false; messageId = 0 };
    };
    let mid = nextChatId;
    chatList.add({ id = mid; projectId; senderEmail; senderName; senderRole; receiverEmail; isDM; text; timestamp });
    nextChatId += 1;
    { ok = true; messageId = mid }
  };

  public query func getGroupChat(projectId : Nat) : async [ChatMessage] {
    chatList.filter(func(m : ChatMessage) : Bool { m.projectId == projectId and not m.isDM }).toArray()
  };

  public query func getDMChat(projectId : Nat, email1 : Text, email2 : Text) : async [ChatMessage] {
    chatList.filter(func(m : ChatMessage) : Bool {
      m.projectId == projectId and m.isDM and
      ((m.senderEmail == email1 and m.receiverEmail == email2) or
       (m.senderEmail == email2 and m.receiverEmail == email1))
    }).toArray()
  };

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────

  public query func getNotifications(email : Text) : async [Notification] {
    notifList.filter(func(n : Notification) : Bool { n.userEmail == email }).toArray()
  };

  public func markNotifRead(email : Text, notifId : Nat) : async { ok : Bool } {
    notifList.mapInPlace(func(n : Notification) : Notification {
      if (n.id == notifId and n.userEmail == email) { { n with isRead = true } } else n
    });
    { ok = true }
  };

  public func markAllNotifsRead(email : Text) : async { ok : Bool } {
    notifList.mapInPlace(func(n : Notification) : Notification {
      if (n.userEmail == email) { { n with isRead = true } } else n
    });
    { ok = true }
  };

  // ─── AUDIT LOG ────────────────────────────────────────────────────────────

  public query func getAuditLog(email : Text, projectId : Nat) : async [AuditEntry] {
    switch (getRole(projectId, email)) {
      case (?#chiefEngineer) {
        let emails = memberList
          .filter(func(m : ProjectMember) : Bool { m.projectId == projectId })
          .map(func(m : ProjectMember) : Text { m.email })
          .toArray();
        auditList.filter(func(a : AuditEntry) : Bool {
          var found = false;
          for (e in emails.vals()) { if (e == a.userEmail) found := true };
          found
        }).toArray()
      };
      case _ { [] };
    }
  };

  // ─── SEED DEMO ────────────────────────────────────────────────────────────

  public func seedDemo() : async { ok : Bool } {
    if (userList.any(func(u : UserProfile) : Bool { u.email == "ce@demo.com" })) {
      return { ok = true };
    };
    userList.add({ email = "ce@demo.com"; name = "Alex Chen (Demo CE)"; pwHash = "ChiefEng@123"; nationality = "\u{1F1FA}\u{1F1F8} United States"; currency = "USD ($)"; phone = "+1 555-0100"; role = #chiefEngineer });
    userList.add({ email = "se@demo.com"; name = "Sam Patel (Demo SE)"; pwHash = "SiteEng@123"; nationality = "\u{1F1EE}\u{1F1F3} India"; currency = "INR (\u{20B9})"; phone = "+91 98765 43210"; role = #siteEngineer });
    userList.add({ email = "me@demo.com"; name = "Maria Lopez (Demo ME)"; pwHash = "MatEng@123"; nationality = "\u{1F1EA}\u{1F1F8} Spain"; currency = "EUR (\u{20AC})"; phone = "+34 612 345 678"; role = #materialsEngineer });
    userList.add({ email = "so@demo.com"; name = "John Smith (Demo SO)"; pwHash = "SiteOwner@123"; nationality = "\u{1F1EC}\u{1F1E7} United Kingdom"; currency = "GBP (\u{00A3})"; phone = "+44 7700 900123"; role = #siteOwner });

    projectList.add({ id = 1; name = "Project Alpha"; location = "Mumbai, India"; startDate = "2026-01-01"; teamCode = "ALPHA42"; pwHash = "ALPHA42"; completion = 45; budget = 5000000; createdBy = "ce@demo.com" });
    projectList.add({ id = 2; name = "Project Beta"; location = "Bangalore, India"; startDate = "2026-02-01"; teamCode = "BETA56"; pwHash = "BETA56"; completion = 20; budget = 3000000; createdBy = "ce@demo.com" });
    projectList.add({ id = 3; name = "Tower 99"; location = "Dubai, UAE"; startDate = "2026-03-01"; teamCode = "TOWER99"; pwHash = "TOWER99"; completion = 60; budget = 10000000; createdBy = "ce@demo.com" });
    nextProjId := 4;

    memberList.add({ projectId = 1; email = "ce@demo.com"; role = #chiefEngineer });
    memberList.add({ projectId = 1; email = "se@demo.com"; role = #siteEngineer });
    memberList.add({ projectId = 1; email = "me@demo.com"; role = #materialsEngineer });
    memberList.add({ projectId = 1; email = "so@demo.com"; role = #siteOwner });
    memberList.add({ projectId = 2; email = "ce@demo.com"; role = #chiefEngineer });
    memberList.add({ projectId = 2; email = "se@demo.com"; role = #siteEngineer });
    memberList.add({ projectId = 3; email = "ce@demo.com"; role = #chiefEngineer });
    memberList.add({ projectId = 3; email = "me@demo.com"; role = #materialsEngineer });

    workerList.add({ id = 1; projectId = 1; name = "Ramesh Kumar"; skill = "Mason"; dailyWage = 800; phone = "9876543210"; wEmail = ""; dialCode = "+91" });
    workerList.add({ id = 2; projectId = 1; name = "Suresh Singh"; skill = "Carpenter"; dailyWage = 750; phone = "9876543211"; wEmail = ""; dialCode = "+91" });
    workerList.add({ id = 3; projectId = 1; name = "Priya Nair"; skill = "Plumber"; dailyWage = 850; phone = "9876543212"; wEmail = ""; dialCode = "+91" });
    workerList.add({ id = 4; projectId = 2; name = "Ahmed Ali"; skill = "Electrician"; dailyWage = 900; phone = "9876543213"; wEmail = ""; dialCode = "+91" });
    nextWrkId := 5;

    materialList.add({ id = 1; projectId = 1; name = "Cement"; unit = "bags"; stock = 200; reorderLevel = 50; priceUsd = 8; supplier = "ABC Cement" });
    materialList.add({ id = 2; projectId = 1; name = "Steel Rebar"; unit = "tons"; stock = 15; reorderLevel = 5; priceUsd = 650; supplier = "Steel Corp" });
    materialList.add({ id = 3; projectId = 1; name = "Sand"; unit = "cubic m"; stock = 80; reorderLevel = 20; priceUsd = 45; supplier = "Local Quarry" });
    materialList.add({ id = 4; projectId = 2; name = "Bricks"; unit = "pieces"; stock = 5000; reorderLevel = 1000; priceUsd = 1; supplier = "Brick Works" });
    materialList.add({ id = 5; projectId = 3; name = "Concrete"; unit = "cubic m"; stock = 120; reorderLevel = 30; priceUsd = 120; supplier = "Ready Mix" });
    nextMatId := 6;

    progressList.add({ id = 1; projectId = 1; pct = 30; notes = "Foundation completed"; date = "2026-02-01"; byEmail = "se@demo.com"; photos = [] });
    progressList.add({ id = 2; projectId = 1; pct = 45; notes = "Ground floor slab poured"; date = "2026-03-01"; byEmail = "se@demo.com"; photos = [] });
    progressList.add({ id = 3; projectId = 2; pct = 20; notes = "Excavation in progress"; date = "2026-02-15"; byEmail = "se@demo.com"; photos = [] });
    nextProgId := 4;

    attendanceList.add({ workerId = 1; projectId = 1; date = "2026-04-01"; status = "present" });
    attendanceList.add({ workerId = 2; projectId = 1; date = "2026-04-01"; status = "present" });
    attendanceList.add({ workerId = 3; projectId = 1; date = "2026-04-01"; status = "absent" });
    attendanceList.add({ workerId = 1; projectId = 1; date = "2026-04-02"; status = "present" });

    chatList.add({ id = 1; projectId = 1; senderEmail = "ce@demo.com"; senderName = "Alex Chen"; senderRole = "Chief Engineer"; receiverEmail = ""; isDM = false; text = "Good morning team! Foundation work looks great."; timestamp = "2026-04-01T09:00:00Z" });
    chatList.add({ id = 2; projectId = 1; senderEmail = "se@demo.com"; senderName = "Sam Patel"; senderRole = "Site Engineer"; receiverEmail = ""; isDM = false; text = "Thanks! Cement delivery scheduled for tomorrow."; timestamp = "2026-04-01T09:15:00Z" });
    nextChatId := 3;

    { ok = true }
  };
};
