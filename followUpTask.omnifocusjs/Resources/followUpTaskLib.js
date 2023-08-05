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
var _this = this;
(function () {
    var lib = new PlugIn.Library(new Version('1.0'));
    lib.addFollowUpTask = function (task) { return __awaiter(_this, void 0, void 0, function () {
        var newTaskDetails, dependencyPlugIn, dependencyLibrary, moveToActionGroupPlugIn, moveToActionGroupLibrary, form, dependencies, dependencyString, prerequisites, prereqString, newTaskForm, editForm, newTask, _i, prerequisites_1, prereq, _a, dependencies_1, dep, proj;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    newTaskDetails = {
                        note: task.note,
                        tags: task.tags,
                        flagged: task.flagged,
                        deferDate: task.deferDate,
                        dueDate: task.dueDate
                    };
                    dependencyPlugIn = PlugIn.find('com.KaitlinSalzke.DependencyForOmniFocus', null);
                    dependencyLibrary = dependencyPlugIn ? dependencyPlugIn.library('dependencyLibrary') : null;
                    moveToActionGroupPlugIn = PlugIn.find('com.KaitlinSalzke.MoveToActionGroup', null);
                    moveToActionGroupLibrary = moveToActionGroupPlugIn ? moveToActionGroupPlugIn.library('moveToActionGroupLib') : null;
                    form = new Form();
                    dependencies = dependencyLibrary ? dependencyLibrary.getDependents(task) : [];
                    dependencyString = dependencies.length > 0 ? "\n\n DEPENDENT: \n - " + dependencies.map(function (task) { return task.name; }).join('\n - ') : '\n\nDEPENDENT: None';
                    prerequisites = dependencyLibrary ? dependencyLibrary.getPrereqs(task) : [];
                    prereqString = prerequisites.length > 0 ? "\n\n PREREQUISITE: \n - " + prerequisites.map(function (task) { return task.name; }).join('\n - ') : '\n\nPREREQUISITE: None';
                    form.addField(new Form.Field.String('taskName', 'New Task', null, null), null);
                    form.addField(new Form.Field.Option('propertiesToTransfer', 'Properties To Transfer', ['all_exc_dependencies', 'all_inc_dependencies', 'select'], ['All except dependencies', 'All including dependencies', 'Select manually'], 'all_exc_dependencies', null), null);
                    if (moveToActionGroupPlugIn)
                        form.addField(new Form.Field.Checkbox('move', 'Move?', false), null);
                    // add validation so that 'Move' is not available if 'Select manually' is chosen
                    form.validate = function (form) {
                        if (form.values.taskName === '' || form.values.taskName === null)
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
                    return [4 /*yield*/, form.show("Add Follow-Up Task" + dependencyString + prereqString, 'Confirm')
                        //=== 'PROPERTIES TO TRANSFER' FORM ==========================================
                    ];
                case 1:
                    _b.sent();
                    if (!(form.values.propertiesToTransfer === 'select')) return [3 /*break*/, 3];
                    newTaskForm = new Form();
                    newTaskForm.addField(new Form.Field.Checkbox('tags', 'Tags', false), null);
                    newTaskForm.addField(new Form.Field.Checkbox('flagged', 'Flagged', false), null);
                    newTaskForm.addField(new Form.Field.Checkbox('deferDate', 'Defer Date', false), null);
                    newTaskForm.addField(new Form.Field.Checkbox('dueDate', 'Due Date', false), null);
                    newTaskForm.addField(new Form.Field.Checkbox('notes', 'Notes', false), null);
                    return [4 /*yield*/, newTaskForm.show('Properties For Transfer', 'Confirm')];
                case 2:
                    _b.sent();
                    newTaskDetails.tags = newTaskForm.values.tags ? task.tags : [];
                    newTaskDetails.flagged = newTaskForm.values.flagged ? task.flagged : false;
                    newTaskDetails.deferDate = newTaskForm.values.deferDate ? task.deferDate : null;
                    newTaskDetails.dueDate = newTaskForm.values.dueDate ? task.dueDate : null;
                    newTaskDetails.note = newTaskForm.values.notes ? task.note : null;
                    _b.label = 3;
                case 3:
                    editForm = new Form();
                    if (moveToActionGroupPlugIn)
                        editForm.addField(new Form.Field.Checkbox('move', 'Move?', form.values.move), null);
                    editForm.addField(new Form.Field.Checkbox('flagged', 'Flagged', newTaskDetails.flagged), null);
                    editForm.addField(new Form.Field.Date('deferDate', 'Defer Date', newTaskDetails.deferDate, null), null);
                    editForm.addField(new Form.Field.Date('dueDate', 'Due Date', newTaskDetails.dueDate, null), null);
                    editForm.addField(new Form.Field.String('notes', 'Notes', newTaskDetails.note, null), null);
                    editForm.addField(new Form.Field.MultipleOptions('tags', 'Tags', flattenedTags, flattenedTags.map(function (t) { return t.name; }), newTaskDetails.tags), null);
                    return [4 /*yield*/, editForm.show('Edit New Task Details', 'Confirm')];
                case 4:
                    _b.sent();
                    newTaskDetails.tags = editForm.values.tags;
                    newTaskDetails.flagged = editForm.values.flagged;
                    newTaskDetails.deferDate = editForm.values.deferDate;
                    newTaskDetails.dueDate = editForm.values.dueDate;
                    newTaskDetails.note = editForm.values.notes;
                    newTask = new Task(form.values.taskName, task.before);
                    //save()
                    newTask.clearTags();
                    newTask.note = newTaskDetails.note;
                    newTask.addTags(newTaskDetails.tags);
                    newTask.flagged = newTaskDetails.flagged;
                    newTask.dueDate = newTaskDetails.dueDate;
                    newTask.deferDate = newTaskDetails.deferDate;
                    if (!(form.values.propertiesToTransfer === 'all_inc_dependencies')) return [3 /*break*/, 14];
                    _i = 0, prerequisites_1 = prerequisites;
                    _b.label = 5;
                case 5:
                    if (!(_i < prerequisites_1.length)) return [3 /*break*/, 9];
                    prereq = prerequisites_1[_i];
                    return [4 /*yield*/, dependencyLibrary.addDependency(prereq, newTask)];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, dependencyLibrary.removeDependency(prereq.id.primaryKey, task.id.primaryKey)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 5];
                case 9:
                    _a = 0, dependencies_1 = dependencies;
                    _b.label = 10;
                case 10:
                    if (!(_a < dependencies_1.length)) return [3 /*break*/, 14];
                    dep = dependencies_1[_a];
                    return [4 /*yield*/, dependencyLibrary.addDependency(newTask, dep)];
                case 11:
                    _b.sent();
                    return [4 /*yield*/, dependencyLibrary.removeDependency(task.id.primaryKey, dep.id.primaryKey)];
                case 12:
                    _b.sent();
                    _b.label = 13;
                case 13:
                    _a++;
                    return [3 /*break*/, 10];
                case 14:
                    // complete original task
                    task.markComplete();
                    if (!(form.values.move || editForm.values.move)) return [3 /*break*/, 17];
                    return [4 /*yield*/, moveToActionGroupLibrary.projectPrompt()];
                case 15:
                    proj = _b.sent();
                    return [4 /*yield*/, moveToActionGroupLibrary.actionGroupPrompt([newTask], proj)];
                case 16:
                    _b.sent();
                    _b.label = 17;
                case 17: return [2 /*return*/];
            }
        });
    }); };
    return lib;
})();
