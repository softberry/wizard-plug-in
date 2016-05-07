# Multi-Step Form Validation PLUG-IN

## Validate wizard type forms with or without server side validation
***********************************************************
### Sample usage :

`$('#element').validateWizard();`
### Installation

+ add *main.min.js* to into your *.html* file. 
+ If you also need number and currency validation add *accounting.js* before *main.min.js* into your **HTML** file
+ Create Form elements in the **HTML** file and assign class="required" for each supported element inside the form. Form elements are optional and can be replaced by any html container (preferably *section* or *div*) see : `sections`

*Refer to sample index.html*

### Default Usage
Hide all `sections` elements inside the main selector  other then first one. According to validation rules, it allows just **one** `section` to be visible at time.

## Testable Elements
1. ``input [type="text"]``  
2. ``input [type="tel"]``  
3. ``input [type="number"]``  
4. ``input [type="currency"]``  
5. ``input [type="email"]``  
6. ``input [type="url"]`` 
7. ``input [type="password"]``  
8. ``input [type="radio"]``  
9. ``input [type="checkbox"]``  
10. ``input [type="date"]``  No validation. It's a nativ HTML5 element and has its own  `min` and `max` attributes  
11. ``input [data-type="datepicker"]``  No Client-Side validation. Use `data-min` and `data-max` to be applied to the jQuery Datepicker Widget.  
``input [data-type="slider"]``  No Client-Side Validation. Use `data-min`, `data-max`, `data-step` to be applied to the jQuery Slider Widget.  
12. ``input [data-type="spinner"]``   No Client-Side Validation. Use `data-min`, `data-max`, `data-step` to be applied to the jQuery Spinner Widget.  
13. ``textarea``  

## Validation Types

All elements that doesn't pass the given validation rules becomes the class name "invalid".
As soon as element passes, this class will be removed. To add an elements to the validation chain add class name ***"required"***.
+ `data-min=value` Expected values can be [Number|Date]
+ `data-max=value` Expected values can be [Number|Date]
+ `data-currency-symbol` Default is '€' but any other text like '$','USD','EUR' etc can be used.
+ `data-currency-format` Deafult is **'%v %s'** . **%s** = symbol, **%v** = value/number. 
+ `data-currency-thousand` Deafult is **.** . Decimal point separator.
+ `data-currency-decimal` Deafult is **,** .  Thousands separator
+ `data-currency-precision` Deafult is **2** .  Decimal places
+ `data-number-thousand` Deafult is **.** . Decimal point separator
+ `data-number-decimal` Deafult is **,** .  Thousands separator
+ `data-number-precision` Deafult is **0** .  Decimal places
+ `data-type` Expected values can be [``"text"`` , ``"number"`` , ``"currency"`` , ``"email"`` , ``url`` , ``"password"`` , ``"radio"`` , ``"checkbox"`` , ``"date"`` , ``"time"`` , ``"datepicker"`` , ``"slider"`` , ``"spinner"`` ]  

~~Its possible to override Browser's default validation styles. Create an input element and instead of **type** use **data-type**~~ Not necessary. Applied autmatically.

## ~~Methods~~
## Options
### All Options are **optional**

* `sections`
By default form elements are the sections. But its also possible to set a class selector, so it will be possible to wrap your form with other elements, like headers,browsing buttons etc. Valid sections are jQuery selectors like `.anyname` or `element`
* `buttons(prev,next,cancel,submit)`
Custom buttons to browse and submit the form(s).Prev, next, send etc. type of buttons    

Example:

```
	buttons:{
        prev: {
            label :"Go back <<",
            position : 0,
            inactive : hide | disable
            },
        next: {
            label :'Continue >>",
            position : 2,
            inactive : hide | disable
            },
        cancel: {
            label : "Reset",
            position : 1,
            inactive : hide | disable
            },
        submit: {
            label : "Send",
            position : /* not used. replaces next button on the last step*/
            }
		ui: true /* navigation buttons are applied jQuery Widget or not */
        }
```
* `invalidClassName("invalid")`: Defaults to "invalid". All invalid elements becomes this css selector and are removed as soon as it becomes valid again.

* `effect` (`blind` | `bounce` | `clip` | `drop` | `explode` | `fade` | `fold` | `puff`,`pulsate` | `shake` | `slide`)Default effect is `drop`. It's possible to add jQuery Effects.

* `password` : Customize  Password validation rule for`input[type=password]` fileds. Default ist 6 to 20 Chars long, must contain at least one digit, one lower,one upper case and one of these '@#$%' special characters.

**Sample `password` Object to be passed**
```
	password:{
		min: 6,
     	max: 20,
        specialChars: '@#$%',
        mustDigits: true,
        mustUpper: true,
        mustLower: true
	}
```
  
* `serverValidation(url,step,expect,onReturn)` Its possible to validate each step on server before moving to the next step.
*Required object*
	* `url ` : absolute or relative path to tha page to be posted
	* `step ` : Any name that will be added to the url with section index. For example : Step "xyz" will be added to the at the end of the post url for the first section as ?xyz=1.
	* `expect ("OK" |[object])` : Default expected value is "OK". Any other returning value other then a JSON String freezes the current step
	* `onReturn` : Overrides default **onreturn** function. It must return TRUE of FALSE

**Sample `serverValidation` Object to be passed**
```
	serverValidation:{
    	url: "/post/here/index.php"
        step: "page"
        expect: "SUCCESS"
    }
```
* `postTo` :Its possible to post values to another page. Default is **same page**. All elements in all steps will be joined together in an Object(or Form) and will be send to given postTo(**url**) as Form or Serialized String depending on `ajax` option.
*`ajax(true|[false])`* Whether to post with ajax or not. Default is **true**.

### Pending Improvements
+   ~~Add one-step form validation~~
+	Test Serverside validation
+	Allow object type wizard to created. Without any html code, create form on the fly.
+	Allow optional validation responses. Currently adds only invalid key to class list. But allow popup/ inline / warn message (text) type validation responses.
+	Optional Validate on change/keyup