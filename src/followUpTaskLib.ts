interface AddTaskForm extends Form {
    values: {
        taskName?: string
        propertiesToTransfer?: string
        move?: boolean
    }
}

interface NewTaskDetailsForm extends Form {
    values: {
        tags?: boolean
        flagged?: boolean
        deferDate?: boolean
        dueDate?: boolean
        notes?: boolean
        prerequisites?: boolean
        dependents?: boolean
    }
}

interface EditTaskForm extends Form {
    values: {
        name?: string
        move?: boolean
        tags?: Tag[]
        flagged?: boolean
        deferDate?: Date
        dueDate?: Date
        notes?: string
        prerequisites?: Task[]
        dependents?: Task[]
    }

}

type TaskDetails = {
    name: string
    note: string
    tags: Tag[]
    flagged: boolean
    deferDate: Date
    dueDate: Date
    prerequisites: Task[]
    dependents: Task[]
}

interface FollowUpTaskLib extends PlugIn.Library {
    emptyTask?: () => TaskDetails
    initialForm?: (task: Task) => AddTaskForm
    propertiesToTransferForm?: (hasPrereqs: boolean, hasDeps: boolean) => NewTaskDetailsForm
    editForm?: (originalPrereqs: Task[], originalDeps: Task[], startingDetails: TaskDetails, move: Boolean) => EditTaskForm
    getTaskDetailsFromEditForm?: (editForm: EditTaskForm) => TaskDetails
    createTask?: (taskDetails: TaskDetails, location: Task.ChildInsertionLocation) => Task
    addFollowUpTask?: (task: Task) => Promise<void>
}

interface DependencyLibrary extends PlugIn.Library {
    getDependents?: (task: Task) => Task[]
    getPrereqs?: (task: Task) => Task[]
    addDependency?: (prereq: Task, dep: Task) => Promise<void>
    removeDependency?: (prereqID: string, depID: string) => Promise<void>
}

interface ActionGroupLib extends PlugIn.Library {
    projectPrompt?: () => Promise<Project>
    actionGroupPrompt?: (tasks: Task[], proj: Project) => Promise<void>
}

(() => {

    const lib: FollowUpTaskLib = new PlugIn.Library(new Version('1.0'))

    lib.emptyTask = () => {
        return {
            name: '',
            note: '',
            tags: [],
            flagged: false,
            deferDate: null,
            dueDate: null,
            prerequisites: [],
            dependents: []
        }
    }

    lib.initialForm = (task: Task) => {
        const moveToActionGroupPlugIn = PlugIn.find('com.KaitlinSalzke.MoveToActionGroup', null)
        const form: AddTaskForm = new Form()

        form.addField(new Form.Field.String('taskName', 'New Task', null, null), null)

        form.addField(new Form.Field.Option('propertiesToTransfer', 'Properties To Transfer', ['all_exc_dependencies', 'all_inc_dependencies', 'select'], ['All except dependencies', 'All including dependencies', 'Select manually'], 'all_exc_dependencies', null), null)
        if (moveToActionGroupPlugIn) form.addField(new Form.Field.Checkbox('move', 'Move?', false), null)

        // add validation so that 'Move' is not available if 'Select manually' is chosen
        form.validate = (form: AddTaskForm) => {
            if (!form.values.taskName || form.values.taskName === '') return false // can't proceed if no task name entered

            const moveCheckboxShowing = form.fields.some(field => field.key === 'move')

            // if 'select' is chosen and move checkbox is shown, hide it (and vice versa)
            if (form.values.propertiesToTransfer === 'select' && moveCheckboxShowing) {
                form.removeField(form.fields.find(field => field.key === 'move'))
            }

            if (form.values.propertiesToTransfer !== 'select' && !moveCheckboxShowing && moveToActionGroupPlugIn) {
                form.addField(new Form.Field.Checkbox('move', 'Move?', false), null)
            }

            return true
        }

        return form

    }

    lib.propertiesToTransferForm = (hasPrereqs: boolean, hasDeps: boolean) => {
        const newTaskForm: NewTaskDetailsForm = new Form()
        newTaskForm.addField(new Form.Field.Checkbox('tags', 'Tags', false), null)
        newTaskForm.addField(new Form.Field.Checkbox('flagged', 'Flagged', false), null)
        newTaskForm.addField(new Form.Field.Checkbox('deferDate', 'Defer Date', false), null)
        newTaskForm.addField(new Form.Field.Checkbox('dueDate', 'Due Date', false), null)
        newTaskForm.addField(new Form.Field.Checkbox('notes', 'Notes', false), null)
        if (hasPrereqs) newTaskForm.addField(new Form.Field.Checkbox('prerequisites', 'Prerequisites', false), null)
        if (hasDeps) newTaskForm.addField(new Form.Field.Checkbox('dependents', 'Dependents', false), null)
        return newTaskForm
    }

    lib.editForm = (originalPrereqs: Task[], originalDeps: Task[], startingDetails: TaskDetails, move: boolean) => {
        const moveToActionGroupPlugIn = PlugIn.find('com.KaitlinSalzke.MoveToActionGroup', null)

        const editForm: EditTaskForm = new Form()
        if (moveToActionGroupPlugIn) editForm.addField(new Form.Field.Checkbox('move', 'Move?', move), null)
        editForm.addField(new Form.Field.String('name', 'Name', startingDetails.name, null), null)
        editForm.addField(new Form.Field.Checkbox('flagged', 'Flagged', startingDetails.flagged), null)
        editForm.addField(new Form.Field.Date('deferDate', 'Defer Date', startingDetails.deferDate, null), null)
        editForm.addField(new Form.Field.Date('dueDate', 'Due Date', startingDetails.dueDate, null), null)
        editForm.addField(new Form.Field.String('notes', 'Notes', startingDetails.note, null), null)
        editForm.addField(new Form.Field.MultipleOptions('prerequisites', 'Prerequisites', originalPrereqs, originalPrereqs.map(t => t.name), startingDetails.prerequisites), null)
        editForm.addField(new Form.Field.MultipleOptions('dependents', 'Dependents', originalDeps, originalDeps.map(t => t.name), startingDetails.dependents), null)
        editForm.addField(new Form.Field.MultipleOptions('tags', 'Tags', flattenedTags, flattenedTags.map(t => t.name), startingDetails.tags), null)
        return editForm
    }

    lib.getTaskDetailsFromEditForm = (editForm: EditTaskForm): TaskDetails => {
        return {
            name: editForm.values.name,
            note: editForm.values.notes,
            tags: editForm.values.tags,
            flagged: editForm.values.flagged,
            deferDate: editForm.values.deferDate,
            dueDate: editForm.values.dueDate,
            prerequisites: editForm.values.prerequisites || [],
            dependents: editForm.values.dependents || []
        }
    }

    lib.createTask = (taskDetails: TaskDetails, location: Task.ChildInsertionLocation) => {
        const newTask = new Task(taskDetails.name, location)

        newTask.clearTags() // stops any tags being inherited inadvertantly

        newTask.note = taskDetails.note
        newTask.addTags(taskDetails.tags)
        newTask.flagged = taskDetails.flagged
        newTask.deferDate = taskDetails.deferDate
        newTask.dueDate = taskDetails.dueDate



        return newTask
    }

    lib.addFollowUpTask = async (task: Task | null) => {

        //=== SET-UP =================================================================

        const dependencyPlugIn = PlugIn.find('com.KaitlinSalzke.DependencyForOmniFocus', null)
        const dependencyLibrary: DependencyLibrary | null = dependencyPlugIn ? dependencyPlugIn.library('dependencyLibrary') : null

        const dependencies: Task[] = (dependencyLibrary && task) ? dependencyLibrary.getDependents(task) : []
        const dependencyString = dependencies.length > 0 ? `\n\nDependent: \n - ${dependencies.map(task => task.name).join('\n - ')}` : ''

        const prerequisites: Task[] = (dependencyLibrary && task) ? dependencyLibrary.getPrereqs(task) : []
        const prereqString = prerequisites.length > 0 ? `\n\nPrerequisite: \n - ${prerequisites.map(task => task.name).join('\n - ')}` : ''

        let newTaskDetails: TaskDetails = task ? {
            name: task.name,
            note: task.note,
            tags: task.tags,
            flagged: task.flagged,
            deferDate: task.deferDate,
            dueDate: task.dueDate,
            prerequisites: prerequisites,
            dependents: dependencies

        } : lib.emptyTask()

        let move = false

        const moveToActionGroupPlugIn = PlugIn.find('com.KaitlinSalzke.MoveToActionGroup', null)
        const moveToActionGroupLibrary: ActionGroupLib | null = moveToActionGroupPlugIn ? moveToActionGroupPlugIn.library('moveToActionGroupLib') : null

        if (task) {

            //=== INITIAL FORM ===========================================================

            const form = lib.initialForm(task)
            await form.show(`ADD FOLLOW-UP TASK${dependencyString}${prereqString}`, 'Confirm')
            newTaskDetails.name = form.values.taskName

            //=== 'PROPERTIES TO TRANSFER' FORM ==========================================

            switch (form.values.propertiesToTransfer) {
                case 'select':
                    const newTaskForm = lib.propertiesToTransferForm(prerequisites.length > 0, dependencies.length > 0)
                    await newTaskForm.show('PROPERTIES FOR TRANSFER', 'Confirm')

                    newTaskDetails.tags = newTaskForm.values.tags ? task.tags : []
                    newTaskDetails.flagged = newTaskForm.values.flagged ? task.flagged : false
                    newTaskDetails.deferDate = newTaskForm.values.deferDate ? task.deferDate : null
                    newTaskDetails.dueDate = newTaskForm.values.dueDate ? task.dueDate : null
                    newTaskDetails.note = newTaskForm.values.notes ? task.note : null
                    newTaskDetails.prerequisites = newTaskForm.values.prerequisites ? prerequisites : []
                    newTaskDetails.dependents = newTaskForm.values.dependents ? dependencies : []
                    break;
                case 'all_inc_dependencies':
                    break
                case 'all_exc_dependencies':
                    newTaskDetails.prerequisites = []
                    newTaskDetails.dependents = []
                    break
                // TODO: don't copy dependency tags

            }

        }

        //=== EDIT TASK FORM ==========================================================

        const editForm = lib.editForm(prerequisites, dependencies, newTaskDetails, move)
        await editForm.show('EDIT NEW TASK DETAILS', 'Confirm')
        move = editForm.values.move

        newTaskDetails = lib.getTaskDetailsFromEditForm(editForm)

        //=== CREATE TASK =============================================================

        // create basic task details
        const locationToAdd = task ? task.after : inbox.ending
        const newTask = lib.createTask(newTaskDetails, locationToAdd)

        // update dependencies
        for (const prereq of newTaskDetails.prerequisites) {
            await dependencyLibrary.addDependency(prereq, newTask)
            await dependencyLibrary.removeDependency(prereq.id.primaryKey, task.id.primaryKey)
        }

        for (const dep of newTaskDetails.dependents) {
            await dependencyLibrary.addDependency(newTask, dep)
            await dependencyLibrary.removeDependency(task.id.primaryKey, dep.id.primaryKey)
        }

        // move the task if specified
        if (move) {
            const proj = await moveToActionGroupLibrary.projectPrompt()
            await moveToActionGroupLibrary.actionGroupPrompt([newTask], proj)
        }
    }

    return lib

})()