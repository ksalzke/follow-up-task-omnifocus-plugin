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
    }
}

interface EditTaskForm extends Form {
    values: {
        move?: boolean
        tags?: Tag[]
        flagged?: boolean
        deferDate?: Date
        dueDate?: Date
        notes?: string
    }

}

interface FollowUpTaskLib extends PlugIn.Library {
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

    lib.addFollowUpTask = async (task: Task) => {

        //=== SET-UP =================================================================

        const newTaskDetails = {
            note: task.note,
            tags: task.tags,
            flagged: task.flagged,
            deferDate: task.deferDate,
            dueDate: task.dueDate,
        }

        const dependencyPlugIn = PlugIn.find('com.KaitlinSalzke.DependencyForOmniFocus', null)
        const dependencyLibrary: DependencyLibrary | null = dependencyPlugIn ? dependencyPlugIn.library('dependencyLibrary') : null

        const moveToActionGroupPlugIn = PlugIn.find('com.KaitlinSalzke.MoveToActionGroup', null)
        const moveToActionGroupLibrary: ActionGroupLib | null = moveToActionGroupPlugIn ? moveToActionGroupPlugIn.library('moveToActionGroupLib') : null

        //=== INITIAL FORM ===========================================================

        const form: AddTaskForm = new Form()

        const dependencies: Task[] = dependencyLibrary ? dependencyLibrary.getDependents(task) : []
        const dependencyString = dependencies.length > 0 ? `\n\n DEPENDENT: \n - ${dependencies.map(task => task.name).join('\n - ')}` : '\n\nDEPENDENT: None'

        const prerequisites: Task[] = dependencyLibrary ? dependencyLibrary.getPrereqs(task) : []
        const prereqString = prerequisites.length > 0 ? `\n\n PREREQUISITE: \n - ${prerequisites.map(task => task.name).join('\n - ')}` : '\n\nPREREQUISITE: None'

        form.addField(new Form.Field.String('taskName', 'New Task', null, null), null)

        form.addField(new Form.Field.Option('propertiesToTransfer', 'Properties To Transfer', ['all_exc_dependencies', 'all_inc_dependencies', 'select'], ['All except dependencies', 'All including dependencies', 'Select manually'], 'all_exc_dependencies', null), null)
        if (moveToActionGroupPlugIn) form.addField(new Form.Field.Checkbox('move', 'Move?', false), null)

        // add validation so that 'Move' is not available if 'Select manually' is chosen
        form.validate = (form: AddTaskForm) => {
            if (form.values.taskName === '' || form.values.taskName === null) return false // can't proceed if no task name entered

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

        await form.show(`Add Follow-Up Task${dependencyString}${prereqString}`, 'Confirm')

        //=== 'PROPERTIES TO TRANSFER' FORM ==========================================

        if (form.values.propertiesToTransfer === 'select') {
            const newTaskForm: NewTaskDetailsForm = new Form()
            newTaskForm.addField(new Form.Field.Checkbox('tags', 'Tags', false), null)
            newTaskForm.addField(new Form.Field.Checkbox('flagged', 'Flagged', false), null)
            newTaskForm.addField(new Form.Field.Checkbox('deferDate', 'Defer Date', false), null)
            newTaskForm.addField(new Form.Field.Checkbox('dueDate', 'Due Date', false), null)
            newTaskForm.addField(new Form.Field.Checkbox('notes', 'Notes', false), null)
            await newTaskForm.show('Properties For Transfer', 'Confirm')

            newTaskDetails.tags = newTaskForm.values.tags ? task.tags : []
            newTaskDetails.flagged = newTaskForm.values.flagged ? task.flagged : false
            newTaskDetails.deferDate = newTaskForm.values.deferDate ? task.deferDate : null
            newTaskDetails.dueDate = newTaskForm.values.dueDate ? task.dueDate : null
            newTaskDetails.note = newTaskForm.values.notes ? task.note : null
        }

        //=== EDIT TASK FORM ==========================================================

        const editForm: EditTaskForm = new Form()
        if (moveToActionGroupPlugIn) editForm.addField(new Form.Field.Checkbox('move', 'Move?', form.values.move), null)
        editForm.addField(new Form.Field.Checkbox('flagged', 'Flagged', newTaskDetails.flagged), null)
        editForm.addField(new Form.Field.Date('deferDate', 'Defer Date', newTaskDetails.deferDate, null), null)
        editForm.addField(new Form.Field.Date('dueDate', 'Due Date', newTaskDetails.dueDate, null), null)
        editForm.addField(new Form.Field.String('notes', 'Notes', newTaskDetails.note, null), null)
        editForm.addField(new Form.Field.MultipleOptions('tags', 'Tags', flattenedTags, flattenedTags.map(t => t.name), newTaskDetails.tags), null)

        await editForm.show('Edit New Task Details', 'Confirm')

        newTaskDetails.tags = editForm.values.tags
        newTaskDetails.flagged = editForm.values.flagged
        newTaskDetails.deferDate = editForm.values.deferDate
        newTaskDetails.dueDate = editForm.values.dueDate
        newTaskDetails.note = editForm.values.notes

        //=== CREATE TASK =============================================================

        // create basic task details

        const newTask: Task = new Task(form.values.taskName, task.before)
        //save()
        newTask.clearTags()
        newTask.note = newTaskDetails.note
        newTask.addTags(newTaskDetails.tags)
        newTask.flagged = newTaskDetails.flagged
        newTask.dueDate = newTaskDetails.dueDate
        newTask.deferDate = newTaskDetails.deferDate

        // update dependencies
        if (form.values.propertiesToTransfer === 'all_inc_dependencies') {
            for (const prereq of prerequisites) {
                await dependencyLibrary.addDependency(prereq, newTask)
                await dependencyLibrary.removeDependency(prereq.id.primaryKey, task.id.primaryKey)
            }

            for (const dep of dependencies) {
                await dependencyLibrary.addDependency(newTask, dep)
                await dependencyLibrary.removeDependency(task.id.primaryKey, dep.id.primaryKey)
            }
        }

        // complete original task
        task.markComplete()


        // move the task if specified
        if (form.values.move || editForm.values.move) {
            const proj = await moveToActionGroupLibrary.projectPrompt()
            await moveToActionGroupLibrary.actionGroupPrompt([newTask], proj)
        }
    }

    return lib

})()