(function () {
  var doc = document.getElementById("doc");
  doc.contentEditable = true;
  doc.focus;

  const getUniqueId = () => {
    return "private-" + Math.random().toString(36).substr(2, 9);
  };

  const getUrlParameter = (name) => {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null
      ? ""
      : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  var id = getUrlParameter("id");
  if (!id) {
    console.log(location.search);
    console.log(location);
    location.search = location.search
      ? "&id=" + getUniqueId()
      : "id=" + getUniqueId();
    return;
  }

  return new Promise(function (resolve, reject) {
    var pusher = new Pusher("51f141add7a2e1e3715f", { cluster: "ap2" });
    var channel = pusher.subscribe(id);
    channel.bind("client-text-edit", (data) => {
      var currentCursorPosition = getCaretCharacter(doc);
      doc.innerHTML = data;
      setCaretPosition(doc, currentCursorPosition);
    });
  }).then(function (channel) {
    function triggerChange(e) {
      console.log(e);
      channel.trigger("client-text-edit", e.target.innerHTML);
    }
    doc.addEventListener("input", triggerChange);
  });
  function getCaretCharacter(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
      sel = win.getSelection();
      if (sel.rangeCount > 0) {
        var range = win.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
    } else if ((sel = doc.selection) && sel.type != "Control") {
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
  }

  function setCaretPosition(el, pos) {
    // Loop through all child nodes
    for (var node of el.childNodes) {
      if (node.nodeType == 3) {
        // we have a text node
        if (node.length >= pos) {
          // finally add our range
          var range = document.createRange(),
            sel = window.getSelection();
          range.setStart(node, pos);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          return -1; // we are done
        } else {
          pos -= node.length;
        }
      } else {
        pos = setCaretPosition(node, pos);
        if (pos == -1) {
          return -1; // no need to finish the for loop
        }
      }
    }
    return pos; // needed because of recursion stuff
  }
})();
