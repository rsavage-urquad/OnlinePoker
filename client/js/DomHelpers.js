/*
Requires
    - Jquery
    - LoDash
*/

/**
* DomHelpers - Set of methods that will assist in DOM element creation and
* manipulation.  To use:
*  - Include this script.
*  - Create an object of this type as an internal property
*  - Call the methods - <internal object>.<method name>(
* of this this type. 
* @constructor
*/
var DomHelpers = function () {
};


// ************************************************************************************************
// DOM Creation and Manipulation Methods
// ************************************************************************************************

/**
 * buildDomObj() - Build a DOM element and apply the passed class and text.
 * @param elemType {string} - Element Type
 * @param elemClass {string} - Class to apply to the element.
 * @param elemText {string} - Text to assign to the element (potentially as HTML)
 * @param allowHtml {boolean} - Determine whether to insert as "text" or "html".
 * @param insertNbsp {boolean} - Determine whether "&nbsp;" should be inserted if Text ui
 */
DomHelpers.prototype.buildDomObj = function (elemType, elemClass, elemText, allowHtml, insertNbsp) {
    var elem = $("<" + elemType + ">");

    // Add the class, if provided.
    if (elemClass.trim() !== "") {
        elem.addClass(elemClass);
    }

    // If insertNbsp requested and Text is null or blank, insert "&nbsp;".
    if ((insertNbsp) &&
        ((elemText === null) || (elemText === undefined) || (elemText.trim() === ""))) {
        elem.html("&nbsp;");
    }
    else {
        if (allowHtml) {
            elem.html(elemText);
        }
        else {
            elem.text(elemText);
        }
    }

    return elem;
};

/**
 * applyClass() - Apply the supplied class name to a field.
 * @param field {string} - Field to apply the ClassName to.
 * @param className {string} - Class to be applied.
 */
DomHelpers.prototype.applyClass = function (field, className) {
    var obj = $("#" + field);
    obj.addClass(className);
};

/**
 * applyAttribute() - Apply the supplied Attribute value to the requested Attribute for a field.
 * @param field {string} - Field to apply the Attribute to.
 * @param attribName {string} - Attribute to applied.
 * @param attribValue {string} - Value to set Attribute to.
 */
DomHelpers.prototype.applyAttribute = function (field, attribName, attribValue) {
    var obj = $("#" + field);
    obj.attr(attribName, attribValue);
};

/**
 * applyAttributeToObj() - Apply the supplied Attribute value to the requested Attribute for an object.
 * @param {object} obj - Object to apply attribute to.
 * @param attribName {string} - Attribute to applied.
 * @param attribValue {string} - Value to set Attribute to.
 */
DomHelpers.prototype.applyAttributeToObj = function (obj, attribName, attribValue) {
    obj.attr(attribName, attribValue);
};


/**
 * buildSelect() - Builds an HTML Select box based on the provided parameters.
 * @param {string} id - Id to use for DOM Element
 * @param {string} name - Name to use for DOM Element
 * @param {string} className - Class information to use for DOM Element
 * @param {Array} options - Collection of Information to populate Options. Each element should have
 *                          "value", "text" and "selected" properties.
 * @param {string} selValue - Value to pre-select.   
 * @returns {Jquery} - Jquery Object for Select DOM Element.
 */
DomHelpers.prototype.buildSelect = function (id, name, className, options, selValue) {
    var sel = $("<select>", { "id": id, "name": name, "class": className });
    var opt;

    _.forEach(options, function(item) {
        if (item.value === selValue) { item.selected = true; }   
        opt = $("<option>", { "value": item.value });
        if (item.selected) {
            opt.attr("selected", "selected");
        }
        opt.text(item.text);
        sel.append(opt);
    });

    return sel;
};

/**
* buildButton() - Build a button and set the click handler based on the parameters.
* @param buttonClass {string} - Button class information
* @param buttonType {string} - Button Type information 
* @param iClass {string} - "<i>" tag (within Button) class information (useful for Icons).
* @param buttonText {string} - Button text (if needed).
* @param clickHandler {function} - Function to call on "click" event.
* @param clickParams {object} - Data to pass to event when button is clicked.
* @returns {*|jQuery|HTMLElement} - "<button>" element.
*/
DomHelpers.prototype.buildButton = function (buttonClass, buttonType, iClass, buttonText, clickHandler, clickParams) {
    var btn = $("<button>", { "class": buttonClass, "type": buttonType });
    var actualText = (iClass === "") ? buttonText : " " + buttonText;
    btn.text(actualText);
    btn.click(clickParams, clickHandler);
    if (iClass !== "") {
        btn.prepend($("<i>", { "class": iClass }));
    }

    return btn;
};

/**
 * buildInput() - Builds an "input" tag for the provided parameters.
 * @param {string} type - Type of input
 * @param {string} name - Name of input 
 * @param {string} id - Id of input
 * @param {string} className - Class to apply to input element
 * @param {string} value - Value of input element
 * @returns {*|jQuery|HTMLElement} - "<input>" element.
 */
DomHelpers.prototype.buildInput = function (type, name, id, className, value) {
    var input = $("<input>", { "type": type, "id": id, "name": name });

    // Set class (if provided)
    if ((className !== undefined) && (className !== null) && (className !== '')) {
        input.addClass(className);
    }

    // Set value (if provided)
    if ((value !== undefined) && (value !== null) && (value !== '')) {
        input.val(value);
    }

    return input;
};

/**
 * getQueryStringObj() - Retrieves the value from the Query String and returns an object
 * contain int the data
 * @returns {Object} - Object with properties on keys and their value's.
 */
DomHelpers.prototype.getQueryStringObj = function () {
    var result = {};
    var url = window.location.search.substring(1);
    var params = url.split("&");
    var qsParam = "";

    // Iterate over the array
    _.forEach(params, function (item) {
        qsParam = item.split("=");
        // Add the key to the object.  If there is just a key and no value, set value to "" (blank).
        result[qsParam[0]] = (qsParam.length > 1) ? result[qsParam[1]] : "";
    });

    return result;
};

/**
 * getQueryStringValueByName() - Gets a Query String value by parameter name.  
 * Found ths on Stack Overflow and liked it better. 
 * @param {string} name - Parameter name. 
 * @param {string} url - Url String (optional, if blank will use current Url)
 * @returns{string} - Query String value. 
 */
DomHelpers.prototype.getQueryStringValueByName = function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}