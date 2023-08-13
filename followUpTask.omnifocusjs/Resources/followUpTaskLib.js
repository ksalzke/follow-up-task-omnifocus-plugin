var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
(function () {
    var lib = new PlugIn.Library(new Version('1.0'));
    lib.loadSyncedPrefs = function () {
        var syncedPrefsPlugin = PlugIn.find('com.KaitlinSalzke.SyncedPrefLibrary', null);
        if (syncedPrefsPlugin !== null) {
            var syncedPrefLib = syncedPrefsPlugin.library('syncedPrefLibrary');
            var SyncedPref_1 = new syncedPrefLib.SyncedPref('com.KaitlinSalzke.followUpTask');
            return SyncedPref_1;
        }
        else {
            var alert = new Alert('Synced Preferences Library Required', 'For the Follow Up Task plug-in to work correctly, the \'Synced Preferences for OmniFocus\' plug-in (https://github.com/ksalzke/synced-preferences-for-omnifocus) is also required and needs to be added to the plug-in folder separately. Either you do not currently have this plugin installed, or it is not installed correctly.');
            alert.show(function () { });
        }
    };
    lib.tagsToShow = function () {
        var syncedPrefs = lib.loadSyncedPrefs();
        var currentSetting = syncedPrefs.read('tagIDs');
        if (currentSetting) {
            return currentSetting.map(function (id) { return Tag.byIdentifier(id); });
        }
        else
            return [];
    };
    lib.emptyTask = function () {
        return {
            name: '',
            note: '',
            tags: [],
            flagged: false,
            deferDate: null,
            dueDate: null,
            prerequisites: [],
            dependents: []
        };
    };
    lib.initialForm = function (task) {
        var moveToActionGroupPlugIn = PlugIn.find('com.KaitlinSalzke.MoveToActionGroup', null);
        var form = new Form();
        form.addField(new Form.Field.String('taskName', 'New Task', null, null), null);
        form.addField(new Form.Field.Option('propertiesToTransfer', 'Properties To Transfer', ['all_exc_dependencies', 'all_inc_dependencies', 'select'], ['All except dependencies', 'All including dependencies', 'Select manually'], 'all_exc_dependencies', null), null);
        if (moveToActionGroupPlugIn)
            form.addField(new Form.Field.Checkbox('move', 'Move?', false), null);
        // add validation so that 'Move' is not available if 'Select manually' is chosen
        form.validate = function (form) {
            if (!form.values.taskName || form.values.taskName === '')
                return false; // can't proceed if no task name entered
            var moveCheckboxShowing = form.fields.some(function (field) { return field.key === 'move'; });
            // if 'select' is chosen and move checkbox is shown, hide it (and vice versa)
            if (form.values.propertiesToTransfer === 'select' && moveCheckboxShowing) {
                form.removeField(form.fields.find(function (field) { return field.key === 'move'; }));
            }
            if (form.values.propertiesToTransfer !== 'select' && !moveCheckboxShowing && moveToActionGroupPlugIn) {
                form.addField(new Form.Field.Checkbox('move', 'Move?', false), null);
            }
            return true;
        };
        return form;
    };
    lib.propertiesToTransferForm = function (hasPrereqs, hasDeps) {
        var newTaskForm = new Form();
        newTaskForm.addField(new Form.Field.Checkbox('tags', 'Tags', false), null);
        newTaskForm.addField(new Form.Field.Checkbox('flagged', 'Flagged', false), null);
        newTaskForm.addField(new Form.Field.Checkbox('deferDate', 'Defer Date', false), null);
        newTaskForm.addField(new Form.Field.Checkbox('dueDate', 'Due Date', false), null);
        newTaskForm.addField(new Form.Field.Checkbox('notes', 'Notes', false), null);
        if (hasPrereqs)
            newTaskForm.addField(new Form.Field.Checkbox('prerequisites', 'Prerequisites', false), null);
        if (hasDeps)
            newTaskForm.addField(new Form.Field.Checkbox('dependents', 'Dependents', false), null);
        return newTaskForm;
    };
    lib.editForm = function (originalPrereqs, originalDeps, startingDetails, move) {
        var moveToActionGroupPlugIn = PlugIn.find('com.KaitlinSalzke.MoveToActionGroup', null);
        var editForm = new Form();
        if (moveToActionGroupPlugIn)
            editForm.addField(new Form.Field.Checkbox('move', 'Move?', move), null);
        editForm.addField(new Form.Field.String('name', 'Name', startingDetails.name, null), null);
        editForm.addField(new Form.Field.Checkbox('flagged', 'Flagged', startingDetails.flagged), null);
        editForm.addField(new Form.Field.Date('deferDate', 'Defer Date', startingDetails.deferDate, null), null);
        editForm.addField(new Form.Field.Date('dueDate', 'Due Date', startingDetails.dueDate, null), null);
        editForm.addField(new Form.Field.String('notes', 'Notes', startingDetails.note, null), null);
        editForm.addField(new Form.Field.MultipleOptions('prerequisites', 'Prerequisites', originalPrereqs, originalPrereqs.map(function (t) { return t.name; }), startingDetails.prerequisites), null);
        editForm.addField(new Form.Field.Checkbox('addPrereq', 'Add prerequisite', false), null);
        editForm.addField(new Form.Field.MultipleOptions('dependents', 'Dependents', originalDeps, originalDeps.map(function (t) { return t.name; }), startingDetails.dependents), null);
        editForm.addField(new Form.Field.Checkbox('addDep', 'Add dependent', false), null);
        var tagsToShow = __spreadArray(__spreadArray([], startingDetails.tags, true), lib.tagsToShow(), true); // TODO: only show once if included in both
        editForm.addField(new Form.Field.MultipleOptions('tags', 'Tags', tagsToShow, tagsToShow.map(function (t) { return t.name; }), startingDetails.tags), null);
        editForm.addField(new Form.Field.Checkbox('addTags', 'Add another tag(s)', false), null);
        return editForm;
    };
    lib.getTaskDetailsFromEditForm = function (editForm) {
        return {
            name: editForm.values.name,
            note: editForm.values.notes,
            tags: editForm.values.tags,
            flagged: editForm.values.flagged,
            deferDate: editForm.values.deferDate,
            dueDate: editForm.values.dueDate,
            prerequisites: editForm.values.prerequisites || [],
            dependents: editForm.values.dependents || []
        };
    };
    lib.createTask = function (taskDetails, location) {
        var newTask = new Task(taskDetails.name, location);
        newTask.clearTags(); // stops any tags being inherited inadvertantly
        newTask.note = taskDetails.note;
        newTask.addTags(taskDetails.tags);
        newTask.flagged = taskDetails.flagged;
        newTask.deferDate = taskDetails.deferDate;
        newTask.dueDate = taskDetails.dueDate;
        return newTask;
    };
    lib.addFollowUpTask = function (task) { return __awaiter(_this, void 0, void 0, function () {
        var dependencyPlugIn, dependencyLibrary, dependencies, dependencyString, prerequisites, prereqString, fuzzySearchPlugIn, alert, fuzzySearchLib, newTaskDetails, move, moveToActionGroupPlugIn, moveToActionGroupLibrary, form, _a, newTaskForm, prereqTag_1, depTag_1, editForm, prereqForm, prereq, depForm, dep, tagForm, activeTags, activeTagNames, tag, locationToAdd, newTask, _i, _b, prereq, _c, _d, dep, proj;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    dependencyPlugIn = PlugIn.find('com.KaitlinSalzke.DependencyForOmniFocus', null);
                    dependencyLibrary = dependencyPlugIn ? dependencyPlugIn.library('dependencyLibrary') : null;
                    dependencies = (dependencyLibrary && task) ? dependencyLibrary.getDependents(task) : [];
                    dependencyString = dependencies.length > 0 ? "\n\nDependent: \n - " + dependencies.map(function (task) { return task.name; }).join('\n - ') : '';
                    prerequisites = (dependencyLibrary && task) ? dependencyLibrary.getPrereqs(task) : [];
                    prereqString = prerequisites.length > 0 ? "\n\nPrerequisite: \n - " + prerequisites.map(function (task) { return task.name; }).join('\n - ') : '';
                    fuzzySearchPlugIn = PlugIn.find('com.KaitlinSalzke.fuzzySearchLib', null);
                    if (!fuzzySearchPlugIn) {
                        alert = new Alert('Fuzzy Search Library Required', 'For the Follow-Up Task plug-in to work correctly, the \'Fuzzy Search\' plug-in (https://github.com/ksalzke/fuzzy-search-library) is also required and needs to be added to the plug-in folder separately. Either you do not currently have this plugin installed, or it is not installed correctly.');
                        alert.show(null);
                    }
                    fuzzySearchLib = fuzzySearchPlugIn.library('fuzzySearchLib');
                    newTaskDetails = task ? {
                        name: task.name,
                        note: task.note,
                        tags: task.tags,
                        flagged: task.flagged,
                        deferDate: task.deferDate,
                        dueDate: task.dueDate,
                        prerequisites: prerequisites,
                        dependents: dependencies
                    } : lib.emptyTask();
                    move = false;
                    moveToActionGroupPlugIn = PlugIn.find('com.KaitlinSalzke.MoveToActionGroup', null);
                    moveToActionGroupLibrary = moveToActionGroupPlugIn ? moveToActionGroupPlugIn.library('moveToActionGroupLib') : null;
                    if (!task) return [3 /*break*/, 9];
                    form = lib.initialForm(task);
                    return [4 /*yield*/, form.show("ADD FOLLOW-UP TASK" + dependencyString + prereqString, 'Confirm')];
                case 1:
                    _e.sent();
                    newTaskDetails.name = form.values.taskName;
                    _a = form.values.propertiesToTransfer;
                    switch (_a) {
                        case 'select': return [3 /*break*/, 2];
                        case 'all_inc_dependencies': return [3 /*break*/, 4];
                        case 'all_exc_dependencies': return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 6];
                case 2:
                    newTaskForm = lib.propertiesToTransferForm(prerequisites.length > 0, dependencies.length > 0);
                    return [4 /*yield*/, newTaskForm.show('PROPERTIES FOR TRANSFER', 'Confirm')];
                case 3:
                    _e.sent();
                    newTaskDetails.tags = newTaskForm.values.tags ? task.tags : [];
                    newTaskDetails.flagged = newTaskForm.values.flagged ? task.flagged : false;
                    newTaskDetails.deferDate = newTaskForm.values.deferDate ? task.deferDate : null;
                    newTaskDetails.dueDate = newTaskForm.values.dueDate ? task.dueDate : null;
                    newTaskDetails.note = newTaskForm.values.notes ? task.note : null;
                    newTaskDetails.prerequisites = newTaskForm.values.prerequisites ? prerequisites : [];
                    newTaskDetails.dependents = newTaskForm.values.dependents ? dependencies : [];
                    return [3 /*break*/, 6];
                case 4: return [3 /*break*/, 6];
                case 5:
                    newTaskDetails.prerequisites = [];
                    newTaskDetails.dependents = [];
                    return [3 /*break*/, 6];
                case 6: return [4 /*yield*/, dependencyLibrary.getPrefTag('prerequisiteTag')];
                case 7:
                    prereqTag_1 = _e.sent();
                    return [4 /*yield*/, dependencyLibrary.getPrefTag('dependentTag')];
                case 8:
                    depTag_1 = _e.sent();
                    newTaskDetails.tags = newTaskDetails.tags.filter(function (tag) { return ![prereqTag_1, depTag_1].includes(tag); });
                    _e.label = 9;
                case 9:
                    editForm = lib.editForm(prerequisites, dependencies, newTaskDetails, move);
                    return [4 /*yield*/, editForm.show('EDIT NEW TASK DETAILS', 'Confirm')];
                case 10:
                    _e.sent();
                    move = editForm.values.move;
                    newTaskDetails = lib.getTaskDetailsFromEditForm(editForm);
                    if (!editForm.values.addPrereq) return [3 /*break*/, 14];
                    prereqForm = void 0;
                    _e.label = 11;
                case 11:
                    prereqForm = fuzzySearchLib.remainingTasksFuzzySearchForm();
                    prereqForm.addField(new Form.Field.Checkbox('another', 'Add another prerequisite?', false), null);
                    // show form
                    return [4 /*yield*/, prereqForm.show('ADD PREREQUISITE', 'Confirm')
                        // processing
                    ];
                case 12:
                    // show form
                    _e.sent();
                    prereq = prereqForm.values.menuItem;
                    newTaskDetails.prerequisites.push(prereq);
                    _e.label = 13;
                case 13:
                    if (prereqForm.values.another) return [3 /*break*/, 11];
                    _e.label = 14;
                case 14:
                    if (!editForm.values.addDep) return [3 /*break*/, 18];
                    depForm = void 0;
                    _e.label = 15;
                case 15:
                    depForm = fuzzySearchLib.remainingTasksFuzzySearchForm();
                    depForm.addField(new Form.Field.Checkbox('another', 'Add another dependent?', false), null);
                    return [4 /*yield*/, depForm.show('ADD DEPENDENT', 'Confirm')
                        // processing
                    ];
                case 16:
                    _e.sent();
                    dep = depForm.values.menuItem;
                    newTaskDetails.dependents.push(dep);
                    _e.label = 17;
                case 17:
                    if (depForm.values.another) return [3 /*break*/, 15];
                    _e.label = 18;
                case 18:
                    if (!editForm.values.addTags) return [3 /*break*/, 22];
                    tagForm = void 0;
                    _e.label = 19;
                case 19:
                    activeTags = flattenedTags.filter(function (tag) { return tag.active; });
                    activeTagNames = activeTags.map(function (t) { return newTaskDetails.tags.includes(t) ? t.name + " [TAGGED]" : t.name; });
                    tagForm = fuzzySearchLib.searchForm(activeTags, activeTagNames, null, null);
                    tagForm.addField(new Form.Field.Checkbox('another', 'Add another tag?', false), null);
                    return [4 /*yield*/, tagForm.show('ADD TAG', 'Confirm')
                        // processing
                    ];
                case 20:
                    _e.sent();
                    tag = tagForm.values.menuItem;
                    newTaskDetails.tags.push(tag);
                    _e.label = 21;
                case 21:
                    if (tagForm.values.another) return [3 /*break*/, 19];
                    _e.label = 22;
                case 22:
                    locationToAdd = task ? task.after : inbox.ending;
                    newTask = lib.createTask(newTaskDetails, locationToAdd);
                    _i = 0, _b = newTaskDetails.prerequisites;
                    _e.label = 23;
                case 23:
                    if (!(_i < _b.length)) return [3 /*break*/, 27];
                    prereq = _b[_i];
                    return [4 /*yield*/, dependencyLibrary.addDependency(prereq, newTask)];
                case 24:
                    _e.sent();
                    return [4 /*yield*/, dependencyLibrary.removeDependency(prereq.id.primaryKey, task.id.primaryKey)];
                case 25:
                    _e.sent();
                    _e.label = 26;
                case 26:
                    _i++;
                    return [3 /*break*/, 23];
                case 27:
                    _c = 0, _d = newTaskDetails.dependents;
                    _e.label = 28;
                case 28:
                    if (!(_c < _d.length)) return [3 /*break*/, 32];
                    dep = _d[_c];
                    return [4 /*yield*/, dependencyLibrary.addDependency(newTask, dep)];
                case 29:
                    _e.sent();
                    return [4 /*yield*/, dependencyLibrary.removeDependency(task.id.primaryKey, dep.id.primaryKey)];
                case 30:
                    _e.sent();
                    _e.label = 31;
                case 31:
                    _c++;
                    return [3 /*break*/, 28];
                case 32:
                    if (!move) return [3 /*break*/, 35];
                    return [4 /*yield*/, moveToActionGroupLibrary.projectPrompt()];
                case 33:
                    proj = _e.sent();
                    return [4 /*yield*/, moveToActionGroupLibrary.actionGroupPrompt([newTask], proj)];
                case 34:
                    _e.sent();
                    _e.label = 35;
                case 35: return [2 /*return*/];
            }
        });
    }); };
    return lib;
})();
