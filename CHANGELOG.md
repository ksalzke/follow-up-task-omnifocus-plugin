## [1.3.2](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/compare/v1.3.1...v1.3.2) (2023-09-04)


### Bug Fixes

* :bug: update move action to use revised function in 'move to action group' lib - and prompt if the minimum version of that library is not installed ([a211501](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/a211501b97e7e6ba5309c8ed2da9a69aa2a5d22e))



## [1.3.1](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/compare/v1.3.0...v1.3.1) (2023-08-25)


### Bug Fixes

* :bug: fix bug where 'note' is not shown in edit dialogue and created task does not finish processing ([e9df726](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/e9df726e773ae5877c59cae8cabeb94e32890af7))
* :bug: fix bug where 'tag' dialogue didn't finish processing when copying from an existing task ([00d4034](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/00d4034494d91a498c596ccacf8715bd76f99653))
* :bug: fix bug where new task with prereq/dep not processed correctly ([a574429](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/a574429f3c4049db1565ba26ee0938a825d45720))



# [1.3.0](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/compare/v1.2.0...v1.3.0) (2023-08-23)


### Features

* :sparkles: add tag dialogue for new task ([da00e6e](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/da00e6ed24767894c66939ec619f0dbe0d2856fe))
* :sparkles: move 'flag' option to tag dialogue when creating a new task ([c157755](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/c1577556148b8b62c6de0c0659e5ca14b5805aa0))



# [1.2.0](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/compare/v1.1.0...v1.2.0) (2023-08-18)


### Bug Fixes

* :bug: fix preference pane not showing - issue [#2](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/issues/2) ([d3d81af](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/d3d81af0976e0b42ec2cda950aa4412b372132cd))
* :bug: show plug-in name in menu (closes [#2](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/issues/2)) ([d2a2d4f](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/d2a2d4ffeeb3b5a11c42682470bdce4d6d2e26cf))


### Features

* :lipstick: label existing prereq/dep tasks in dropdown ([613cd0e](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/613cd0e99e6f3f695658adbf54678c9ae403efbc))
* :lipstick: remove 'move checkbox' from first dialogue ([7983801](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/7983801ffce826547a0888a8b51323d952dfc5b1))
* :lipstick: update first dialogue header to reflect action ([01c6953](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/01c6953a9a4252aafa903dc3b1553056129db02b))
* :sparkles: add 'today tag' option ([e502d0b](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/e502d0b3fb889e900414e2d4b088d3a312b33eac))
* :sparkles: only show properties in transfer dialogue that are not null in original task ([cc3591e](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/cc3591e688ded93d78e110cf537fe0d86f269899))
* :sparkles: show project/action group path in dialogue (and change order) ([61a3c91](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/61a3c919edede2a68afeaa05e1ab45746651e85f))
* :sparkles: show reduced edit form if no task selected (and auto-move) ([cc54bd7](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/cc54bd74cf377d89bd3b7bc398a2f1dc0a5846ba))



# [1.1.0](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/compare/631ce47df0994980dec2187c70501d309203a514...v1.1.0) (2023-08-13)


### Bug Fixes

* :bug: don't copy dependent and prereq helper tags ([aa25ee9](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/aa25ee97939cb99891a849ea9459a24e84ce6ea3))
* :bug: fix validation - cannot proceed without task name ([5cd5a85](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/5cd5a850282eb34320c2fa739a82e9de67df5933))
* :bug: stop tags from containing group being applied to new task ([631ce47](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/631ce47df0994980dec2187c70501d309203a514))
* :lipstick: minor changes to headings and dependency info ([da92df5](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/da92df53042291d6f6adc4733c2fe634a237add7))
* :lipstick: only show prereqs and deps in 'properties to transfer' when they exist ([df6de6b](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/df6de6bda14a31ee7afff23fdc903db12c51410b))


### Features

* :sparkles: add ability to add prerequisites and dependent tasks ([b2af17f](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/b2af17ffbb526fc1e71b8ba47a20a7988c48299b))
* :sparkles: add preferences form and pref for tags included in edit form ([ac1fdd0](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/ac1fdd088d45987d90d8733c93cc3768ce199300))
* :sparkles: add search form to add additional tags ([dac3f25](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/dac3f252bd46ea0ef9e49b39c92dbea14400ca8d))
* :sparkles: add special case: add new task to inbox when nothing selected and include deps and prereqs ([19b0585](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/19b058585abcbfda67746a58405ec10cb35eaea2))
* :sparkles: split into three functions: complete, drop, leave selected ([7be0222](https://github.com/ksalzke/follow-up-task-omnifocus-plugin/commit/7be02221ab541ad707fc4a70f81432b80ba97e00))



