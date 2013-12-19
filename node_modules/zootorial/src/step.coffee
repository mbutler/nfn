class Step
  className: ''

  # The following can be string, function, or jQuery objects.
  number: NaN # One-indexed!
  header: ''
  details: ''
  instruction: ''
  buttons: ''

  next: null
  nextButton: 'Continue'

  demo: null
  demoButton: 'Show me'

  attachment: 'center middle window center middle'

  block: '' # Prevent these from being clicked.
  focus: '' # Block everything but this (limited to one element).
  actionable: '' # These get a special class.

  onEnter: null
  onExit: null

  started: null
  blockers: null
  focusers: null

  constructor: (params = {}) ->
    @[property] = value for own property, value of params when property of @

  enter: (tutorial) ->
    @started = new Date

    @onEnter? tutorial

    wait =>
      parent = tutorial.el.parent()
      @createBlockers parent
      @createFocusers parent
      @blockers.add(@focusers).removeClass 'hidden'

      $(@actionable).addClass 'actionable'

    tutorial.el.trigger 'enter-tutorial-step', [@, tutorial]

    null

  createBlockers: (parent) ->
    @blockers = $()
    parentOffset = parent.offset()

    for blocked in $(@block)
      blocked = $(blocked)
      blockedOffset = blocked.offset()

      blocker = $('<div class="hidden zootorial-blocker"></div>')
      @blockers = @blockers.add blocker

      blocker.width blocked.outerWidth()
      blocker.height blocked.outerHeight()

      blocker.offset
        left: blockedOffset.left - parentOffset.left
        top: blockedOffset.top - parentOffset.top

    @blockers.appendTo parent

    null

  createFocusers: (parent) ->
    focuserMarkup = '<div class="hidden zootorial-focuser"></div>'
    @focusers = $(focuserMarkup + focuserMarkup + focuserMarkup + focuserMarkup)

    focus = $(@focus).filter(':visible').first()
    return if focus.length is 0

    offset = focus.offset()
    width = focus.outerWidth()
    height = focus.outerHeight()

    totalHeight = $document.outerHeight()
    totalWidth = $document.outerWidth()

    above = @focusers.eq 0
    above.offset left: 0, top: 0
    above.width '100%'
    above.height offset.top

    right = @focusers.eq 1
    right.offset left: offset.left + width, top: offset.top
    right.width totalWidth - offset.left - width
    right.height height

    bottom = @focusers.eq 2
    bottom.offset left: 0, top: offset.top + height
    bottom.width '100%'
    bottom.height totalHeight - offset.top - height

    left = @focusers.eq 3
    left.offset left: 0, top: offset.top
    left.width offset.left
    left.height height

    @focusers.appendTo parent

    null

  exit: (tutorial) ->
    @onExit? tutorial

    $(@actionable).removeClass 'actionable'

    extras = @blockers.add @focusers
    extras.addClass 'hidden'
    wait 250, =>
      extras.remove()
      @blockers = null
      @focusers = null

    finished = (new Date) - @started
    @started = null

    sleuth?.logCustomEvent {type: 'tutorial-step', value: @number} 
    tutorial.el.trigger 'exit-tutorial-step', [@, tutorial, finished]

    null
