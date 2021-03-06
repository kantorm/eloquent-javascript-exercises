//Project painting program
//helper function for building DOM elements
  function elt(name, attributes) {
    var node = document.createElement(name);
    if (attributes) {
      for (var attr in attributes)
        if (attributes.hasOwnProperty(attr))
          node.setAttribute(attr, attributes[attr]);
    }
    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];
      if (typeof child == "string")
        child = document.createTextNode(child);
      node.appendChild(child);
    }
    return node;
  }

  var controls = Object.create(null); // Object that holds funtions to intialize controls below image

  function createPaint(parent) {
    var canvas = elt("canvas", {width: 500, height: 300});
    var cx = canvas.getContext("2d");
    var toolbar = elt("div", {class: "toolbar"});
    for (var name in controls)
      toolbar.appendChild(controls[name](cx));

    var panel = elt("div", {class: "picturepanel"}, canvas);
    parent.appendChild(elt("div", null, panel, toolbar));
  }

  var tools = Object.create(null); //object that collect tools

  controls.tool = function(cx) {
    var select = elt("select");
    for (var name in tools)
      select.appendChild(elt("option", null, name));

    cx.canvas.addEventListener("mousedown", function(event) {
    if (event.which == 1) {
      tools[select.value](event, cx);
      event.preventDefault();
    }
  });

  return elt("span", null, "Tool: ", select);
};

//finding coordinates of of cursor
  function relativePos(event, element) {
    var rect = element.getBoundingClientRect();
    return {x: Math.floor(event.clientX - rect.left),
          y: Math.floor(event.clientY - rect.top)};
  }

//tracking drag move for some tools
  function trackDrag(onMove, onEnd) {
    function end(event) {
      removeEventListener("mousemove", onMove);
      removeEventListener("mouseup", end);
      if (onEnd)
        onEnd(event);
      }
      addEventListener("mousemove", onMove);
      addEventListener("mouseup", end);
    }

  tools.Line = function(event, cx, onEnd) {
    cx.lineCap = "round";

    var pos = relativePos(event, cx.canvas);
    trackDrag(function(event) {       //as long as mousemove the line is being drawn
      cx.beginPath();
      cx.moveTo(pos.x, pos.y);
      pos = relativePos(event, cx.canvas);
      cx.lineTo(pos.x, pos.y);
      cx.stroke();
    }, onEnd);
  };
//Eraser
  tools.Erase = function(event, cx) {
    cx.globalCompositeOperation = "destination-out";
    tools.Line(event, cx, function() {
      cx.globalCompositeOperation = "source-over";
    });
  };

//input for color choosing
  controls.color = function(cx) {
    var input = elt("input", {type: "color"});
    input.addEventListener("change", function() {
      cx.fillStyle = input.value;
      cx.strokeStyle = input.value;
    });
    return elt("span", null, "Color: ", input);
  };


  controls.brushSize = function(cx) {
    var select = elt("select");
    var sizes = [1, 2, 3, 5, 8, 12, 25, 35, 50, 75, 100];
    sizes.forEach(function(size) {
      select.appendChild(elt("option", {value: size},
                           size + " pixels"));
                         });
      select.addEventListener("change", function() {
        cx.lineWidth = select.value;
      });
    return elt("span", null, "Brush size: ", select);
  };

//Saving picture in URL
controls.save = function(cx) {
  var link = elt("a", {href: "/"}, "Save");
  function update() {
    try {
      link.href = cx.canvas.toDataURL();
    } catch (e) {
      if (e instanceof SecurityError)
        link.href = "javascript:alert(" +
          JSON.stringify("Can't save: " + e.toString()) + ")";
      else
        throw e;
    }
  }
  link.addEventListener("mouseover", update);
  link.addEventListener("focus", update);
  return link;
};

//
  function loadImageURL(cx, url) {
    var image = document.createElement("img");
    image.addEventListener("load", function() {
      var color = cx.fillStyle, size = cx.lineWidth;
      cx.canvas.width = image.width;
      cx.canvas.height = image.height;
      cx.drawImage(image, 0, 0);
      cx.fillStyle = color;
      cx.strokeStyle = color;
      cx.lineWidth = size;
    });
    image.src = url;
  }

//loading local file
  controls.openFile = function(cx) {
    var input = elt("input", {type: "file"});
    input.addEventListener("change", function() {
      if (input.files.length == 0) return;
      var reader = new FileReader();
      reader.addEventListener("load", function() {
        loadImageURL(cx, reader.result);
      });
      reader.readAsDataURL(input.files[0]);
    });
    return elt("div", null, "Open file: ", input);
  };

//loading image from url into canvas on submit
  controls.openURL = function(cx) {
    var input = elt("input", {type: "text"});
    var form = elt("form", null,
                 "Open URL: ", input,
                 elt("button", {type: "submit"}, "load"));
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      loadImageURL(cx, input.value);
    });
    return form;
  };

//Text tool
  tools.Text = function(event, cx) {
    var text = prompt("Text:", "");
    if (text) {
      var pos = relativePos(event, cx.canvas);
      cx.font = Math.max(7, cx.lineWidth) + "px sans-serif";
      cx.fillText(text, pos.x, pos.y);
    }
  };

//Spray tool
tools.Spray = function(event, cx) {
  var radius = cx.lineWidth / 2;
  var area = radius * radius * Math.PI;
  var dotsPerTick = Math.ceil(area / 30);

  var currentPos = relativePos(event, cx.canvas);
  var spray = setInterval(function() {
    for (var i = 0; i < dotsPerTick; i++) {
      var offset = randomPointInRadius(radius);
      cx.fillRect(currentPos.x + offset.x,
                  currentPos.y + offset.y, 1, 1);
    }
  }, 25);
  trackDrag(function(event) {
    currentPos = relativePos(event, cx.canvas);
  }, function() {
      clearInterval(spray);
    });
  };

  function randomPointInRadius(radius) {
    for (;;) {
      var x = Math.random() * 2 - 1;
      var y = Math.random() * 2 - 1;
      if (x * x + y * y <= 1)
        return {x: x * radius, y: y * radius};
      }
  }

//Ex. 1 Rectangles
function rectangleFrom(a, b) {
    return {left: Math.min(a.x, b.x),
            top: Math.min(a.y, b.y),
            width: Math.abs(a.x - b.x),
            height: Math.abs(a.y - b.y)};
  }

  tools.Rectangle = function(event, cx) {
    var relativeStart = relativePos(event, cx.canvas);
    var pageStart = {x: event.pageX, y: event.pageY};

    var trackingNode = document.createElement("div");
    trackingNode.style.position = "absolute";
    trackingNode.style.background = cx.fillStyle;
    document.body.appendChild(trackingNode);

    trackDrag(function(event) {
      var rect = rectangleFrom(pageStart,
                               {x: event.pageX, y: event.pageY});
      trackingNode.style.left = rect.left + "px";
      trackingNode.style.top = rect.top + "px";
      trackingNode.style.width = rect.width + "px";
      trackingNode.style.height = rect.height + "px";
    }, function(event) {
      var rect = rectangleFrom(relativeStart,
                               relativePos(event, cx.canvas));
      cx.fillRect(rect.left, rect.top, rect.width, rect.height);
      document.body.removeChild(trackingNode);
    });
  };

//Ex. 2 Color picker
  function colorAt(cx, x, y) {
    var pixel = cx.getImageDate(x, y, 1, 1).data;
    return "rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
  }

  tools["Pick color"] = function(event, cx) {
    var pos = relativePos(event, cx.canvas);
    try {
      var color = colorAt(cx, pox.x, pos.y);
    } catch(e) {
      if (e instanceof SecurityError) {         //Security error is not defined
        alert("Unable to access your picture's pixel data");
        return;
      } else {
        throw e;
      }
    }
    cx.fillStyle = color;
    cx.strokeStyle = color;
  };

  //Ex. 3 Flood fill
  // Call a given function for all horizontal and vertical neighbors
// of the given point.
function forAllNeighbors(point, fn) {
  fn({x: point.x, y: point.y + 1});
  fn({x: point.x, y: point.y - 1});
  fn({x: point.x + 1, y: point.y});
  fn({x: point.x - 1, y: point.y});
}

// Given two positions, returns true when they hold the same color.
function isSameColor(data, pos1, pos2) {
  var offset1 = (pos1.x + pos1.y * data.width) * 4;
  var offset2 = (pos2.x + pos2.y * data.width) * 4;
  for (var i = 0; i < 4; i++) {
    if (data.data[offset1 + i] != data.data[offset2 + i])
      return false;
  }
  return true;
}

tools["Flood fill"] = function(event, cx) {
  var startPos = relativePos(event, cx.canvas);

  var data = cx.getImageData(0, 0, cx.canvas.width,
                             cx.canvas.height);
  // An array with one place for each pixel in the image.
  var alreadyFilled = new Array(data.width * data.height);

  // This is a list of same-colored pixel coordinates that we have
  // not handled yet.
  var workList = [startPos];
  while (workList.length) {
    var pos = workList.pop();
    var offset = pos.x + data.width * pos.y;
    if (alreadyFilled[offset]) continue;

    cx.fillRect(pos.x, pos.y, 1, 1);
    alreadyFilled[offset] = true;

    forAllNeighbors(pos, function(neighbor) {
      if (neighbor.x >= 0 && neighbor.x < data.width &&
          neighbor.y >= 0 && neighbor.y < data.height &&
          isSameColor(data, startPos, neighbor))
        workList.push(neighbor);
    });
  }
};
