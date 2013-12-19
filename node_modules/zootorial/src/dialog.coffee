class Dialog
  className: ''
  content: ''
  attachment: null

  parent: document.body
  el: null
  contentContainer: null

  constructor: (params = {}) ->
    @[property] = value for own property, value of params when property of @

    @el = $('''
      <div class="zootorial-dialog">
        <button name="close-dialog">&times;</button>
        <div class="dialog-content"></div>
        <div class="dialog-arrow"></div>
      </div>
    ''')

    @el.addClass @className

    @contentContainer = @el.find '.dialog-content'

    @el.on 'click', 'button[name="close-dialog"]', =>
      @el.trigger 'click-close-dialog', [@]
      @close()

    $(window).on 'resize', => @attach()

    @el.appendTo @parent

  render: (@content = @content) ->
    @contentContainer.html @content
    @attach()
    @el.trigger 'render-dialog', [@, @content]
    null

  attach: (@attachment = @attachment) ->
    return unless @el.hasClass 'open'

    # Note: Attachment strings look like this:
    # Dialog-x dialog-y selector selector-x selector-y
    # e.g. "left top to #some > .selector right bottom"
    @attachment ?= 'center middle body center middle'

    [elX, elY, selector..., toX, toY] = @attachment.split /\s+/
    selector = selector.join ' '
    attach @el, [elX, elY], selector, [toX, toY]
    @el.trigger 'attach-dialog', [@, @attachment]

    null

  open: ->
    return if @el.hasClass 'open'
    @el.css display: 'none'
    @el.addClass 'open'
    @render()
    wait => @el.css display: ''
    @el.trigger 'open-dialog', [@]
    null

  close: ->
    return unless @el.hasClass 'open'
    @el.removeClass 'open'
    @el.css left: '', position: '', top: ''
    @el.trigger 'close-dialog', [@]
    null

  destroy: ->
    return unless @el?
    @close()
    @el.remove()
    @el.trigger 'destroy-dialog', [@]
    @el.off()
    [@content, @attachment, @parent, @el, @contentContainer] = []
    null
