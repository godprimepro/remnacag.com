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
        root.functionalDom = factory(root.jQuery);
    }
}(window, function ($) {
    function LightFunctionalDom() {
        var self = this;
        self.fipNameAttribute = "data-fip-name";
        self.fipIndexAttribute = "data-fip-index";


        /**
         * Extract the name and a optional index of a given path
         * ex: "FundArea[2]" => { name: FundArea, index: 2 }
         * ex: "TopBar" => { name: TopBar }
         * @param {string} path
         */
        function parseToken(path) {
            var r = new RegExp(/([\w|(|)]+)(\[[0-9\*]+\])/);
            var groups = r.exec(path);
            if (groups == null) return { name: path }
            var index = groups[2].replace("[", "").replace("]", "");
            if (index === "*") {
                return {
                    name: groups[1],
                    index: index
                }
            } else {
                return {
                    name: groups[1],
                    index: parseInt(index)
                }
            }
        }

        /**
         * Get the number of element corresponding to the given fip path
         * @param {string} fipPath 
         * @param {DOMElement} currentElement 
         * @returns {int} 
         */
        self.getItemCountByFipPath = function (fipPath, currentElement) {
            var matchingItems = self.getItemByFipPath(fipPath, currentElement);
            return matchingItems ? matchingItems.length : 0;
        };

        /**
        * Fetch the DOM Element corresponding to a given relative Fip Path from the provided element
        * ex: "Home>FundArea[1]" => '<div data-fip-name="FundArea" data-fip-index="1" ...>
        * ex: "TopBar > Help"
        * @param {string} fipPath
        * @param {DOMElement} currentElement element from which the search has to be started. We consider body as a start element when it is empty
        * @returns {DOMElement} 
        */
        self.getItemByFipPath = function (fipPath, currentElement) {
            var paths = fipPath.split(">");
            // accept empty path so that current element can be targetted
            if (paths[paths.length - 1].trim() === "") {
                paths.pop();
            }

            if (paths.length === 0) {
                return undefined;
            }

            //No current element provided --> Start from body
            if (!currentElement) {
                currentElement = $("body");
            }

            var elem = $(currentElement);
            var multipleMatchingItems = false;
            for (var i = 0; i < paths.length; i++) {
                var obj = parseToken(paths[i].trim());
                var filter = "[" + self.fipNameAttribute + "='" + obj.name + "']";

                // specific index to be retrieved if no fip-index specified
                var retrieveSpecificIndex = null;

                if (obj.index) {
                    if (obj.index !== "*") {

                        // compatible with old browsers
                        if (obj.name.substr(-2) === "()") {
                            // if data fip index not specified: take everything and then go to the nth
                            retrieveSpecificIndex = obj.index;
                            multipleMatchingItems = true;
                        } else {
                            filter += "[" + self.fipIndexAttribute + "='" + obj.index + "']";
                        }
                        
                    } else if (obj.index === "*") {
                        //If path endsWith [*], we'll return multiple elements
                        multipleMatchingItems = true;
                    }
                }

                //When reaching an iFrame, we need to switch the currentElement to the internal document of the iFrame
                if (elem.length === 1 && elem.is("iframe")) {
                    elem = $(elem[0].contentDocument);
                }
                elem = elem.closestDescendant(filter, multipleMatchingItems);

                if (retrieveSpecificIndex != null) {
                    elem = elem.eq(retrieveSpecificIndex);
                    multipleMatchingItems = false;
                }

                //We couldn't find a part of the path --> Exit right away
                if (elem.length === 0) {
                    return undefined;
                }
            }
            return elem ? (multipleMatchingItems ? elem : elem[0]) : undefined;
        }
    }
   return new LightFunctionalDom();
}));
