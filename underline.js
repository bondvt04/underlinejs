/**
 * UnderlineJS 0.0.1 (29.06.2013)
 * https://github.com/P54l0m5h1k/underlinejs
 * UnderlineJS may be freely distributed under the MIT license
 * 2013 Anton Trofimenko ©
 */
(function (window) {
    window.__ = {
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
        int: function (variable, radix, onFailure) {
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
        float: function (mixed_var) {
            return (parseFloat(mixed_var) || 0);
        },
        /**
         * Save any variable as string
         * @param {*} value
         * @returns {*}
         */
        serialize: function (value) {
            return __.type(value) == "object" && !__.countObj(value) ? "{}" : JSON.stringify(value);
        },
        /**
         * Destringify string to object
         * @param {string} string
         * @returns {*}
         */
        unserialize: function (string) {
            if (__.type(string) != "string") return "";
            return string === "[object Object]" ? {} : JSON.parse(string);
        },
        /**
         * Count of attributes in object
         * @param {*} obj
         * @returns {number}
         */
        countObj: function (obj) {
            if (__.type(obj) != "object") return 0;
            return obj.length === +obj.length ? obj.length : __.keys(obj).length;
        },
        /**
         * Get type of variable
         * @param {*} variable
         * @returns {string}
         */
        type: function (variable) {
            return Object.prototype.toString.call(variable).split(" ").pop().split("]").shift().toLowerCase();
        },
        /**
         * If variable one of types
         * @param {*} value
         * @param {Array|string} types
         * @returns {boolean}
         * @example _.typeIn("Text", ["string", "integer"]);
         */
        typeIn: function (value, types) {
            if (__.type(types) == "string")
                return __.type(value) == types;
            if (__.type(types) == "array")
                return __.contains(types, value, 0);
            return false;
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
            var parts = path.split(".");
            for (var i = 0, l = parts.length; i < l; i++) {
                if (!__.prop(object, parts[i]))
                    return false;
                object = object[parts[i]];
            }
            return __.typeIn(object, types);
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
            return __.prop(object, property) && __.type(object[property]) == type;
        },


        /**
         * Check nested property existence
         * @param {object} object
         * @param {string} path
         * @returns {boolean}
         * @example _.propPath(MyObject, "property.property.property.value");
         */
        propPath: function (object, path) {
            var parts = path.split(".");
            for (var i = 0, l = parts.length; i < l; i++) {
                var part = parts[i];
                if (!_.prop(object, part))
                    return false;
                object = object[part];
            }
            return true;
        },
        /**
         * Own property exists, not in prototype
         * @param {object} object
         * @param {string} property
         * @returns {boolean}
         */
        propOwn: function (object, property) {
            return _.type(object) == "object" ? Object.prototype.hasOwnProperty.call(object, property) : false;
        },
        /**
         * Property exists
         * @param {object} object
         * @param {string} property
         * @returns {boolean}
         */
        prop: function (object, property) {
            return __.type(object) == "object" && property in object;
        },
        /**
         * Property exists in prototype
         * @param {object} object
         * @param {string} property
         * @returns {boolean}
         */
        propPrototype: function (object, property) {
            return __.prop(object, property) && !__.propOwn(object, property);
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
            return __.prop(object, property) && strict && __.equal(object[property], equals, strict);
        },
        /**
         * Check variables
         * @param {*} variable1
         * @param {*} variable2
         * @param {boolean} strict
         * @returns {boolean}
         */
        equal: function (variable1, variable2, strict) {
            if (isNaN(variable1) && isNaN(variable2)) return true;
            return strict ? variable1 === variable2 : variable1 == variable2;
        },
        /**
         * Return keys of array or object
         * @param {object|Array} object
         * @returns {Array}
         */
        keys: function (object) {
            if(__.typeIn(object, ["string", "object"])) {
                return [];
            }
            var keys = [];
            for (var key in object) {
                keys[keys.length] = key;
            }
            return keys;
        }
    };
}(this));