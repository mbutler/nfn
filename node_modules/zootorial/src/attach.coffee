attach = (el, [elX, elY] = [], to, [toX, toY] = [], {margin} = {}) ->
  el = $(el)
  throw new Error 'Couldn\'t find an element to attach.' if el.length is 0

  to ?= window
  to = $(to).filter(':visible').first()
  to = $(window) if to.length is 0

  margin ?= 0

  positions =
    left: 0, center: 0.5, right: 1
    top: 0, middle: 0.5, bottom: 1

  elX ?= 'center'
  elX = positions[elX] if elX of positions

  elY ?= 'middle'
  elY = positions[elY] if elY of positions

  toX ?= 'center'
  toX = positions[toX] if toX of positions

  toY ?= 'middle'
  toY = positions[toY] if toY of positions

  toSize =
    width: to.outerWidth() + (margin * 2)
    height: to.outerHeight() + (margin * 2)

  toOffset = to.offset() || left: 0, top: 0
  toOffset.top -= margin
  toOffset.left -= margin

  elOriginalDisplay = el.get(0).style.display

  el.css display: 'block', position: 'absolute'

  elSize =
    width: el.outerWidth()
    height: el.outerHeight()

  el.css display: elOriginalDisplay

  newElOffset =
    left: toOffset.left - (elSize.width * elX) + (toSize.width * toX)
    top: toOffset.top - (elSize.height * elY) + (toSize.height * toY)

  el.offset newElOffset

  null
