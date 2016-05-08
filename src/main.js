/**
 * Created by es on 30.03.2015.
 */
;
$(function () {
    /**
     * the widget definition, where "softberry" is the namespace,
     * "validateWizard" the widget name
     */
    $.widget("softberry.validateWizard", {
        // default options
        /**
         * @object Deafault values for the plug-in
         */
        options: {
            sections: 'form',
            buttons: {
                prev: {
                    label: '&lt;&lt; Previous'
                },
                next: {
                    label: 'Next &gt;&gt;'
                },
                cancel: {
                    label: 'Reset'
                },
                submit: {
                    label: 'Send'
                },
                ui: true
            },
            effect: 'drop',
            password: {
                min: 6,
                max: 20,
                specialChars: '@#$%',
                mustDigits: true,
                mustUpper: true,
                mustLower: true
            },
            invalidClassName: 'invalid',
            serverValidation: {
                url: '',
                step: '',
                expect: 'OK',
                /*
                 Only ClientSide Validation is default
                 Simply return what expected :)
                 */
                onReturn: function () {
                    return 'OK'
                }
            },
            postTo: '',
            ajax: true,
            currencySettings: {
                currency: {
                    symbol: "€",        // default currency symbol is '€'
                    format: "%v %s",    // controls output: %s = symbol, %v = value/number
                    decimal: ",",       // decimal point separator
                    thousand: ".",      // thousands separator
                    precision: 2        // decimal places
                },
                number: {
                    precision: 0,       // default precision on numbers is 0
                    thousand: ".",      // thousands separator
                    decimal: ","        // decimal point separator
                }
            }
        },
        step: [],                       // holds each section in array
        pwPattern: "",                  // holds pattern for password validity
        currentStep: 0,                 // watches current index of the sections
        nav: {},                        // holds navigation buttons
        rawHTML: '',                    // holds untouched HTML source to e used for destroying this widget
        stepCount: null,                // holds how many sections do we have
        data: {},                       // will be prepared and collect all data in all sections to be posted to the server
        /**
         * validate all fileds in current Step
         * @returns {boolean}
         * @private
         */
        _validate: function () {
            // find and validate required items inside current step
            var isValid = true;
            var self = this;
            //get current section name
            var sectionName = (typeof this.step[this.currentStep].attr('name') === 'undefined') ? 'section' + this.currentStep : this.step[this.currentStep].attr('name').attr('name');
            //get current section from name
            var currentSection = self.data [sectionName];
            this.step[this.currentStep].find('.required').each(
                function (e, i) {
                    switch ($(i).data('type')) {
                        case 'text':
                            /*
                             min-length : default 1
                             max-length : default ..
                             */
                            isValid = isValid && self._validateText($(i));
                            var textValid = self._validateText($(i));
                            currentSection[$(i).attr('name')] = textValid ? $(i).val() : '';
                            self._formatValidation($(i), textValid);
                            break;
                        case 'tel':
                            /*
                             only numbers,(,),-,+ and whitespaces allowed
                             */
                            var telValid = self._validateTel($(i));
                            isValid = isValid && telValid;
                            currentSection[$(i).attr('name')] = telValid ? $(i).val() : '';
                            self._formatValidation($(i), telValid);
                            break;
                        case 'number':
                            /*
                             only digits are allowed
                             */
                            var numValid = self._validateNumber($(i));
                            isValid = isValid && numValid;
                            currentSection[$(i).attr('name')] = numValid ? $(i).val() : '';
                            self._formatValidation($(i), numValid);
                            break;
                        case 'currency':
                            /*
                             format input as currency . allow locale definitions like '1,25' or '1.25' and currency info like '€', '$','EUR' etc...
                             */
                            var curValid = self._validateCurrency($(i));
                            isValid = isValid && curValid;
                            currentSection[$(i).attr('name')] = curValid ? accounting.unformat($(i).val()) : '';
                            self._formatValidation($(i), curValid);
                            break;
                        case 'email':
                            var mailValid = self._validateMail($(i));
                            isValid = isValid && mailValid;
                            currentSection[$(i).attr('name')] = mailValid ? $(i).val() : '';
                            self._formatValidation($(i), mailValid);
                            break;
                        case 'url':
                            var urlValid = self._validateURL($(i));
                            isValid = isValid && urlValid;
                            currentSection[$(i).attr('name')] = urlValid ? $(i).val() : '';
                            self._formatValidation($(i), urlValid);
                            break;
                        case 'password':
                            var passValid = self._validatePassword($(i));
                            isValid = isValid && passValid;
                            currentSection[$(i).attr('name')] = passValid ? $(i).val() : '';
                            self._formatValidation($(i), passValid);
                            break;
                        case 'radio':
                            var radioValid = self._validateRadio($(i));
                            isValid = isValid && radioValid;
                            currentSection[$(i).attr('name')] = radioValid ? $(i).val() : '';
                            self._formatValidation($(i), radioValid);
                            break;
                        case 'checkbox':
                            //if set it means that this chekcbox must be selected
                            // to be use in forms like accept terms&conditions
                            var checkValid = self._validateCheckBox($(i));
                            isValid = isValid && checkValid;
                            currentSection[$(i).attr('name')] = checkValid;
                            self._formatValidation($(i), checkValid);
                            break;
                        case 'date':

                            break;
                        case 'datepicker':
                            currentSection[$(i).attr('name')] = $(i).datepicker('getDate');
                            break;
                        case 'slider':
                            currentSection[$(i).attr('name')] = $(i).slider('value');
                            break;
                        case 'spinner':
                            currentSection[$(i).attr('name')] = $(i).spinner('value');
                            break;
                        case 'time':
                            break;
                    }
                }
            );
            this.step[this.currentStep].find('textarea.required').each(
                function (e, i) {

                    var textAreaValid = self._validateText($(i));
                    isValid = isValid && textAreaValid;
                    currentSection[$(i).attr('name')] = textAreaValid ? $(i).val() : '';
                    self._formatValidation($(i), textAreaValid);
                }
            );
            return isValid;
        },
        /**
         * validate String
         * @param elem
         * @returns {boolean}
         * @private
         */
        _validateText: function (elem) {
            /*
             * validate text input against text length
             * if not defined min length:1 - max length : 255
             * return true if both pass the test, otherwise false
             * */
            // remove empty strings
            elem.val(elem.val().trim());
            var max = elem.data('max') > 0 ? elem.data('max') : 255;
            var min = elem.data('min') >= 0 ? elem.data('min') : 1;
            var len = elem.val().length;
            return len >= min && len <= max;
        },
        /**
         * Validate -email address
         * @param elem
         * @returns {boolean}
         * @private
         */
        _validateMail: function (elem) {
            var max = 255;
            var min = 7;
            var len = elem.val().length;
            var e = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i;
            return (len >= min && len <= max) && e.test(elem.val());
        },
        /**
         * validate URL
         * @param elem
         * @returns {boolean}
         * @private
         */
        _validateURL: function (elem) {
            /*
             validates only if the given sting contains only allowed string
             but doesn't validate if the URL well formatted.
             */
            var max = 255;
            var min = 7;
            var len = elem.val().length;
            var e = /^([!#$&-;=?-\[\]_a-z~]|%[0-9a-fA-F]{2})+$/;
            return (len >= min && len <= max) && e.test(elem.val());
        },
        /**
         * Validate Telephone number
         * @param elem
         * @returns {boolean}
         * @private
         */
        _validateTel: function (elem) {
            var max = elem.data('max') > 0 ? elem.data('max') : 255;
            var min = elem.data('min') >= 0 ? elem.data('min') : 1;
            var len = elem.val().length;
            var r = /^[0-9+\(\)#\.\s\/ext-]+$/ig;
            return (len >= min && len <= max) && r.test(elem.val());
        },
        /**
         * Validate Currency
         * @param elem
         * @returns {boolean}
         * @private
         */
        _validateNumber: function (elem) {
            var max = elem.data('max') > 0 ? elem.data('max') : 2 ^ 53 - 1;
            var min = elem.data('min') >= 0 ? elem.data('min') : -1 * (2 ^ 53 - 1);
            var len = elem.val().length;
            var r = /^\d{1,45}$/ig;
            var formatted = accounting.formatNumber(elem.val());
            elem.val(formatted);
            return (len >= min && len <= max) && r.test(elem.val());
        },
        /**
         * Validate currency
         * @param elem
         * @returns {boolean}
         * @private
         */
        _validateCurrency: function (elem) {
            var max = elem.data('max') > 0 ? elem.data('max') : 2 ^ 53 - 1;
            var min = elem.data('min') >= 0 ? elem.data('min') : -1 * (2 ^ 53 - 1);
            var asNum = accounting.unformat(elem.val());
            var formatted = accounting.formatMoney(elem.val());
            elem.val(formatted);
            return asNum >= min && asNum <= max;
        },
        /**
         * validate password
         * @param elem
         * @returns {boolean}
         * @private
         */
        _validatePassword: function (elem) {
            var r = new RegExp(this.pwPattern, 'g');
            return r.test(elem.val());
        },
        /**
         * Validate radio
         * @param elem
         * @returns {*|jQuery}
         * @private
         */
        _validateRadio: function (elem) {
            var n = elem.attr('name');
            var r = this.step[this.currentStep].find(' input[name="' + n + '"]');
            var checked = $(r).is(':checked');
            return checked;
        },
        /**
         * validate checkbox
         * @param elem
         * @returns {*}
         * @private
         */
        _validateCheckBox: function (elem) {
            return elem.is(':checked');
        },
        /**
         * add|remove validity className
         * @param elem
         * @param valid
         * @private
         */
        _formatValidation: function (elem, valid) {
            var inValCls = this.options.invalidClassName;
            valid ? elem.removeClass(inValCls) : elem.addClass(inValCls);
        },
        /**
         *
         * @param str
         * @returns {*}
         * @private
         */
        _getUniqueID: function (str) {
            var tmpStr = str;
            while ($('#' + tmpStr).length > 0) {
                tmpStr = str + String(Math.random()).slice(2, 8);
            }
            return tmpStr;
        },
        /**
         * save type parameter to data-type to unify type values for all accepted elements
         * @private
         */
        _typeToDataType: function () {
            $(this.options.sections).find('input').each(function (e, i) {
                var input = $(i);
                var types = ['text', 'tel', 'number', 'currency', 'email', 'password', 'radio', 'checkbox', 'date', 'datepicker', 'textarea', 'slider', 'spinner', 'time', 'url'];
                for (var t = 0; t < types.length; t++) {
                    if (input.attr('type') == types[t]) {
                        input.attr('data-type', types[t]);
                    }
                }
                //apply default types too
                for (t = 0; t < types.length; t++) {
                    if (input.attr('data-type') == types[t]) {
                        input.attr('type', types[t]);
                    }
                }
                // apply conditional exceptions
                /*convert currency fields to standard text fields*/
                if (input.attr('data-type') == 'currency') {
                    input.attr('type', 'text');
                }
                /*convert number fields to standard text fields*/
                if (input.attr('data-type') == 'number') {
                    input.attr('type', 'text');
                }
                //make sure all data-taype=password elemets are also set to type=password
                if (input.attr('data-type') == 'password') {
                    input.attr('type', 'password');
                }
                //convert data-type = date fields to type = date fields
                if (input.attr('data-type') == 'date' && input.attr('type') != "date") {
                    input.attr('type', 'date');
                }
                //apply datepicker
                if (input.attr('data-type') == 'datepicker') {
                    input.datepicker({
                        minDate: (typeof input.attr('data-min') == 'undefined') ? null : typeof input.attr('data-min'),
                        maxDate: (typeof input.attr('data-max') == 'undefined') ? null : typeof input.attr('data-max')
                    });
                }
                // apply spinners
                if (input.attr('data-type') == 'spinner') {
                    input.spinner();
                }
                // apply slider
                if (input.attr('data-type') == 'slider') {
                    // hide each element and add insert just after a new slider UI
                    input.attr({type: 'hidden'});


                    var optionsSlider = {
                        min: (typeof input.attr('data-min') === 'undefined') ? 0 : Number(input.attr('data-min')),
                        max: (typeof input.attr('data-max') === 'undefined') ? 100 : Number(input.attr('data-max')),
                        step: (typeof input.attr('data-step') === 'undefined') ? 1 : Number(input.attr('data-step')),
                        change: function () {
                            input.val($(this).slider('value'));
                        }

                    };

                    // apply all class and style info to the newly created slider
                    var objSlider = $('<div>').attr({
                        class: input.attr('class'),
                        style: input.attr('style')
                    }).slider(optionsSlider);
                    /*
                     {
                     change:function (e, i) {
                     input.val($(this).slider('value'));
                     }
                     }
                     */

                    input.after(objSlider);
                }

            })
        },
        /**
         * Constructor of the Plug-In
         * @private
         */
        _create: function () {
            //TODO: add validation support to simple forms as one-step wizard
            var self = this;
            this.rawHTML = this.element.clone();
            this._typeToDataType();
            //apply accounting settings
            accounting.settings = this.options.currencySettings;
            //Hide sections > 1
            this.stepCount = $(this.element).children($(this.options.sections)).length;

            $(this.element).children($(this.options.sections)).each(function (e, i) {
                //prepare Empty Serialized Object
                var objName = (typeof $(i).attr('name') === 'undefined') ? 'section' + $(i).index() : $(i).attr('name');
                self.data[objName] = {};
                //Override form submission
                if (self.options.sections == 'form') {
                    self._on($(i), {submit: self._submit});
                }
            });
            //adjust count to null(0) indexing
            this.stepCount--;
            //check if server Side Validation function supplied
            if (this.options.serverValidation.onReturn == null) {
                // Apply default
            } else {

            }
            // Create password validation pattern
            var conditions = {
                digits: '(?=.*[0-9])',
                lowers: '(?=.*[a-z])',
                uppers: '(?=.*[A-Z])',
                special: '(?=.*[@#$%])'
            };
            var ptr = "";
            ptr += (this.options.password.mustDigits) ? conditions.digits : '';
            ptr += (this.options.password.mustLower) ? conditions.lowers : '';
            ptr += (this.options.password.mustUpper) ? conditions.uppers : '';
            ptr = '(' + ptr + '(?=.*[' + this.options.password.specialChars + ']).{' + this.options.password.min + ',' + this.options.password.max + '})';
            this.pwPattern = ptr;
            this.element.find(this.options.sections).each(function (e, i) {
                self.step[e] = $(i);
                $(i).addClass('wizard-step');
                if (e > 0) $(i).hide();
            });
            //Add navigation buttons
            this.nav.bar = $('<div>').addClass('wizard-nav-bar');
            this.nav.prev = $('<button>').html(this.options.buttons.prev.label).addClass('wizard-btn-prev').hide();
            this.nav.next = $('<button>').html(this.options.buttons.next.label).addClass('wizard-btn-next');
            this.nav.cancel = $('<button>').html(this.options.buttons.cancel.label).addClass('wizard-btn-cancel');
            this.nav.submit = $('<button>').html(this.options.buttons.submit.label).addClass('wizard-btn-submit').hide();
            this.nav.bar.append([this.nav.prev, this.nav.cancel, this.nav.submit, this.nav.next]);
            this.element.append(this.nav.bar);
            this._on(this.nav.prev, {click: this._gotoPrev});
            this._on(this.nav.next, {click: this._gotoNext});
            this._on(this.nav.cancel, {click: this._cancel});
            this._on(this.nav.submit, {click: this._submit});
            if (this.stepCount == 0) {
                // this is one step wizard. navigation not required
                this.nav.prev.remove();
                this.nav.next.remove();
                this.nav.submit.show();
            }
            // Apply jQuery Widget UI to the navbuttons
            if (this.options.buttons.ui) $('button').button();
        }
        ,
        /**
         * called when created, and later when changing options
         * @private
         */
        _refresh: function () {
        },
        /**
         * prepare url that will be POSTed
         * @returns {string}
         * @private
         */
        _getPostToAdr:function(){
            var url =this.options.serverValidation.url;
            if (url=='') return '';
            url+= (String(url).search(/\?/)<0) ? '?' : '&';
            url +=this.options.serverValidation.step;
            url +='='+this.currentStep;
            return url;
        }
        ,
        /**
         * go to next step, if current step is valid
         * @private
         */
        _gotoNext: function () {
            //validate first client-side
            var self = this;
            if (!this._validate()) return;

            if(this._getPostToAdr() != '') {
                //if serverValidation returns false do not go to next step

                $.post(this._getPostToAdr(),this.options.serverValidation.onReturn);
               // if (this.options.serverValidation.expect != this.options.serverValidation.onReturn()) return;

            }
            if (this.currentStep + 1 == this.stepCount) {
                this.nav.next.hide();
                this.nav.submit.show();
            }
            //show go back button
            this.nav.prev.show();
            //hide current section

            $(this.step[this.currentStep]).hide(this.options.effect, function () {
                //set next step
                self.currentStep++;
                //show next section
                $(self.step[self.currentStep]).show(self.options.effect);
                //set focus to first element in current section
                self.step[self.currentStep].children('input:first').focus();
            });


        }
        ,
        /**
         * go back to previous step
         * @private
         */
        _gotoPrev: function () {
            var self = this;
            if (this.currentStep > 0) {
                $(this.step[this.currentStep]).hide(this.options.effect, function () {
                    self.currentStep--;
                    $(self.step[self.currentStep]).show(self.options.effect);
                    //set focus to first element in current section
                    self.step[self.currentStep].children('input:first').focus();
                });


            }
            if (this.currentStep == 0) {
                this.nav.prev.hide();
            }
            if (this.stepCount > 0) {
                this.nav.next.show();
            } else {
                this.nav.submit.show();
            }
        }
        ,
        /**
         *
         * @private
         */
        _cancel: function () {

        }
        ,
        /**
         * check individual step if acceptable to go to next step or final submit
         * @returns {boolean}
         * @private
         */
        _submit: function () {
            if (!this._validate()) return false;
            if (this.currentStep < this.stepCount) {
                this._gotoNext();
                return false;
            }
            $.post(this.postTo, this.data, function (data) {
                alert(data)
            });
            return false;
        }
        ,
        /**
         * events bound via _on are removed automatically
         * revert other modifications here
         * @private
         */
        _destroy: function () {
            // remove generated elements
            //this.changer.remove();
            this.element.html(this.rawHTML);

        }
        ,
        /**
         * _setOptions is called with a hash of all options that are changing
         * always refresh when changing options
         * @private
         */
        _setOptions: function () {
            // _super and _superApply handle keeping the right this-context
            this._superApply(arguments);
            this._refresh();
        }
        ,
        /**
         * _setOption is called for each individual option that is changing
         * @param key   name of the option
         * @param value value of the given option
         * @private
         */
        _setOption: function (key, value) {
            // check if values are suitable first
            this._super(key, value);
        }
    })
    ;

})
;