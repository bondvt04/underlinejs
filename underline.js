/**
 * UnderlineJS 0.0.2 (04.01.2013)
 * https://github.com/P54l0m5h1k/underlinejs
 * UnderlineJS may be freely distributed under the MIT license
 * 2013 Anton Trofimenko ©
 */
(function (window) {
    if (typeof window._ != "function") {
        window._ = {};
        window._.mixin = function (functions) {
            for (var newFunction in functions)
                if (functions.hasOwnProperty(newFunction))
                    window._[newFunction] = functions[newFunction];
        };
    }
    _.mixin({
        /**
         * Typecast variable to number
         * @param {*} value
         * @param {int} precision
         * @param {string} mode
         * @returns {number}
         * @example toNumber(1241757, -3); -> 1242000
         * @example toNumber(3.6); -> 4
         * @example toNumber(2.835, 2); -> 2.84
         * @example toNumber(1.1749999999999, 2); -> 1.17
         * @example toNumber(58551.799999999996, 2); -> 58551.8
         */
        toNumber: function (value, precision, mode) {
            var m, f, isHalf, sgn;
            precision |= 0;
            m = Math.pow(10, precision);
            value *= m;
            sgn = (value > 0) | -(value < 0);
            isHalf = value % 1 === 0.5 * sgn;
            f = Math.floor(value);
            if (isHalf) {
                switch (mode) {
                    case "HALF_DOWN":
                        value = f + (sgn < 0); // rounds .5 toward zero
                        break;
                    case "HALF_EVEN":
                        value = f + (f % 2 * sgn); // rouds .5 towards the next even integer
                        break;
                    case "HALF_ODD":
                        value = f + !(f % 2); // rounds .5 towards the next odd integer
                        break;
                    default:
                        value = f + (sgn > 0); // rounds .5 away from zero
                }
            }
            return (isHalf ? value : Math.round(value)) / m;
        },
        /**
         * Typecast variable to integer
         * @param {*} variable
         * @param {int} [radix=10]
         * @param {int} [onFailure=0]
         * @returns {number}
         */
        toInt1: function (variable, radix, onFailure) {
            var tmp, type = typeof(variable);
            if (type === "boolean") {
                return +variable;
            } else if (type === "string") {
                tmp = parseInt(variable, radix || 10);
                return (isNaN(tmp) || !isFinite(tmp)) ? onFailure || 0 : tmp;
            } else if (type === "number" && isFinite(variable)) {
                return variable | 0;
            }
            return onFailure;
        },
        /**
         * Typecast variable to float
         * @param {*} mixed_var
         * @returns {Number}
         * @example toFloat('-50 + 8'); -> -50
         */
        toFloat: function (mixed_var) {
            return parseFloat(mixed_var) || 0;
        },
        /**
         * Save any variable as string
         * @param {*} value
         * @returns {*}
         */
        serialize: function (value) {
            return "object" != _.type(value) || _.countObj(value) ? JSON.stringify(value) : "{}"
        },
        /**
         * Destringify string to object
         * @param {string} string
         * @returns {*}
         */
        unserialize: function (string) {
            return "string" != _.type(string) ? "" : "[object Object]" === string ? {} : JSON.parse(string)
        },
        /**
         * Count of attributes in object
         * @param {*} object
         * @returns {number}
         */
        countObj: function (object) {
            return"object" != _.type(object) ? 0 : object.length === +object.length ? object.length : _.keys(object).length
        },
        /**
         * Get type of variable
         * @param {*} variable
         * @returns {string}
         */
        type: function (variable) {
            return Object.prototype.toString.call(variable).split(" ").pop().split("]").shift().toLowerCase()
        },
        /**
         * If variable one of types
         * @param {*} value
         * @param {Array|string} types
         * @returns {boolean}
         * @example _.typeIn("Text", ["string", "integer"]);
         */
        typeIn: function (value, types) {
            return "string" == _.type(types) ? _.type(value) == types : "array" == _.type(types) ? _.contains(types, value, 0) : false
        },
        /**
         * Check nested property existence
         * @param {object} object
         * @param {string} path
         * @param {string|Array} types
         * @returns {boolean}
         * @example _.propPath(MyObject, "property.property.property.value");
         */
        propPathType: function (object, path, types) {
            for (var parts = path.split("."), index = 0, length = parts.length; length > index; index++) {
                if (!_.prop(object, parts[index]))
                    return false;
                object = object[parts[index]]
            }
            return _.typeIn(object, types)
        },
        /**
         * Is object has a property of this type
         * @param {object} object
         * @param {string} property
         * @param {string} type
         * @returns {boolean}
         * @example _.propType({someProperty: "this is string"}, "someProperty", "string")
         */
        propType: function (object, property, type) {
            return _.prop(object, property) && _.type(object[property]) == type
        },
        /**
         * Check nested property existence
         * @param {object} object
         * @param {string} path
         * @returns {boolean}
         * @example _.propPath(MyObject, "property.property.property.value");
         */
        propPath: function (object, path) {
            for (var parts = path.split("."), index = 0, length = parts.length; length > index; index++) {
                var part = parts[index];
                if (!_.prop(object, part))
                    return false;
                object = object[part]
            }
            return true
        },
        /**
         * Own property exists, not in prototype
         * @param {object} object
         * @param {string} property
         * @returns {boolean}
         */
        propOwn: function (object, property) {
            return _.type(object) == "object" ? Object.prototype.hasOwnProperty.call(object, property) : false
        },
        /**
         * Property exists
         * @param {object} object
         * @param {string} property
         * @returns {boolean}
         */
        prop: function (object, property) {
            return _.type(object) == "object" && property in object
        },
        /**
         * Property exists in prototype
         * @param {object} object
         * @param {string} property
         * @returns {boolean}
         */
        propPrototype: function (object, property) {
            return _.prop(object, property) && !_.propOwn(object, property)
        },
        /**
         * Property equals passed variable
         * @param {object} object
         * @param {string} property
         * @param {*} equals
         * @param {boolean} strict
         * @returns {boolean}
         * @example _.propType({someProperty: "this is string"}, "someProperty", "string")
         */
        propEquals: function (object, property, equals, strict) {
            return _.prop(object, property) && strict && _.equal(object[property], equals, strict)
        },
        /**
         * Check variables
         * @param {*} variable1
         * @param {*} variable2
         * @param {boolean} strict
         * @returns {boolean}
         */
        equal: function (variable1, variable2, strict) {
            return isNaN(variable1) && isNaN(variable2) ? true : strict ? variable1 === variable2 : variable1 == variable2
        }
    });
}(this));