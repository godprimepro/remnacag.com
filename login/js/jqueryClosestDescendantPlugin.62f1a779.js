(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        var jQuery = require("jquery");
        module.exports = factory(jQuery);
    } else {
        // Browser globals (root is window)
        factory(root.jQuery);
    }
}(window, function ($) {
    //https://github.com/tlindig/jquery-closest-descendant/blob/master/dist/closestDescendant.js
    $.fn.closestDescendant = function (selector, findAll) {

        if (!selector || selector === '') {
            return $();
        }

        findAll = findAll ? true : false;

        var resultSet = $();

        this.each(function () {

            var $this = $(this);

            // breadth first search for every matched node,
            // go deeper, until a child was found in the current subtree or the leave was reached.
            var queue = [];
            queue.push($this);
            while (queue.length > 0) {
                var node = queue.shift();
                var children = node.children();
                for (var i = 0; i < children.length; ++i) {
                    var $child = $(children[i]);
                    if ($child.is(selector)) {
                        resultSet.push($child[0]); //well, we found one
                        if (!findAll) {
                            return false; //stop processing
                        }
                    } else {
                        queue.push($child); //go deeper
                    }
                }
            }
        });

        return resultSet;
    };
}));