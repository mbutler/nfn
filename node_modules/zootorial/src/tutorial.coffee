STEP_PARTS = ['header', 'details', 'instruction', 'buttons']

class Tutorial extends Dialog
  id: ''
  steps: null # NOTE: The "length" property defines potential progress.
  firstStep: null

  header: null
  details: null
  instruction: null
  buttons: null

  progress: null
  progressTrack: null
  progressFill: null
  progressSteps: null

  started: null
  currentStep: null

  constructor: (params = {}) ->
    super
    @id ||= Math.random.toString(16).split('.')[1]
    @steps ?= []
    @firstStep ?= @steps[0] if @steps instanceof Array

    @el.addClass 'tutorial'

    @content = $('''
      <div>
        <div class="header"></div>
        <div class="details"></div>
        <div class="instruction"></div>
        <div class="buttons"></div>
        <div class="progress">
          <div class="track"><div class="fill"></div></div>
          <div class="steps"></div>
        </div>
      </div>
    ''')

    for stepPart in STEP_PARTS
      @[stepPart] = @content.find ".#{stepPart}"

    @progress = @content.find '.progress'
    @progressTrack = @progress.find '.track'
    @progressFill = @progress.find '.fill'
    @progressSteps = @progress.find '.steps'

    unless isNaN @steps.length
      @progress.addClass 'defined'
      @progressFill.css width: '0%'
      @progressSteps.append '<span class="step"></span>' for step in [0...@steps.length]

    @el.on 'click', 'button[name="next-step"]', =>
      @load @currentStep.next

    @el.on 'click', 'button[name="demo"]', =>
      demoButton = @el.find 'button[name="demo"]'
      demoButton.attr disabled: true
      @currentStep.demo ->
        demoButton.attr disabled: false

    @el.on 'click-close-dialog', =>
      @end()

  load: (step) ->
    # Trying to load a true or null step in an array of steps will first try to load the next one.
    if (not step?) or (step is true)
      if @steps instanceof Array
        index = i for step, i in @steps when step is @currentStep
        step = @steps[index + 1]

      if (not step?) or (step is true)
        @complete()
        return

    # If the next step is false, stay on the current step but highlight the instruction.
    if step is false
      @instruction.addClass 'attention'
      return

    # If given a function, run it to find the actual step.
    if typeof step is 'function'
      step = step.call @

    # You can refer to steps by their key or index.
    unless step instanceof Step
      step = @steps[step]

    # We should have a proper step at this point.

    # Don't reload same step.
    return if step is @currentStep

    # Unload the current step.
    @unload @currentStep if @currentStep
    @el.addClass step.className

    # Wait a tick so any DOM changes can take place and the size of the dialog can be figured out.
    wait 100, =>
      @attach step.attachment

    # Fill in the new content.
    for stepPart in STEP_PARTS
      @[stepPart].html step[stepPart]?(@) || step[stepPart] || ''
      @[stepPart].addClass 'defined' if @[stepPart].html()

    isStep = step.next instanceof Step
    isPrimitive = typeof step.next in ['string', 'number', 'boolean']
    isFunction = typeof step.next is 'function'
    isntDefined = not step.next?

    # Auto-add a "next" button if the next step doesn't rely on an event.
    if isStep or isPrimitive or isFunction or isntDefined
      @buttons.html "<button name='next-step'>#{step.nextButton}</button>"
      @buttons.addClass 'defined'

    # Otherwise the next step is determined in response to an event.
    else

      # Store this since function contexts get a little messy below.
      tutorial = @

      for eventString, next of step.next then do (eventString, next) =>
        [eventName, selector...] = eventString.split /\s+/
        selector = selector.join ' '
        $document.on "#{eventName}.zootorial-#{@id}", selector, (e) ->
          # Note that function context here is whatever triggered the event.

          if typeof next is 'function'
            tutorial.load next.call step, e, @
          else
            tutorial.load next

    if step.demo?
      @instruction.append "<button name='demo'>#{step.demoButton}</button>"

    # Get the step number, if you can...
    if @steps instanceof Array
      stepNumber = i + 1 for s, i in @steps when s is step
    else unless isNaN @steps.length
      stepNumber = step.number

    # ...and update the tutorial's progress.
    unless isNaN stepNumber
      wait 250, =>
        @progressFill.css width: "#{100 * ((stepNumber) / @steps.length)}%"

      for child, i in @progressSteps.children()
        $(child).toggleClass 'passed', i + 1 < stepNumber
        $(child).toggleClass 'active', i + 1 is stepNumber

    step.enter @
    @currentStep = step

    null

  unload: ->

    return unless @currentStep

    @instruction.removeClass 'attention'

    @el.removeClass @currentStep.className

    for stepPart in STEP_PARTS
      @[stepPart].html ''
      @[stepPart].removeClass 'defined'

    $document.off ".zootorial-#{@id}"

    @currentStep.exit @
    @currentStep = null

    null

  start: ->
    @close()
    @started = new Date
    @unload()
    @load @firstStep
    @open()
    @el.trigger 'start-tutorial', [@, @started]
    null

  complete: ->
    finished = new Date - @started
    @el.trigger 'complete-tutorial', [@, finished]
    @end()
    null

  end: ->
    @unload()
    finished = new Date - @started
    @started = null
    @close()
    @el.trigger 'end-tutorial', [@, finished]
    null
