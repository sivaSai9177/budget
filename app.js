//BUDGET CONTROLLER

var budgetController = (function () {
    //some code
    var Expense = function (id, description, value) {
        this.id = id,
            this.description = description,
            this.value = value,
            this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else (
            this.percentage = -1
        );
    };
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    var Income = function (id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    };
    var calculateTotal= function (type) {
        sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0  
        },
        budget: 0,
        percentage:-1,
    };

    return {
        addItems: function (type, des, val) {
            var newItem, Id;
            //create a new id
            if (data.allItems[type].length > 0) {
                Id = data.allItems[type][data.allItems[type].length - 1].id + 1;   
            } else {
                Id = 0;
            }
            //create newItem
            if (type === 'exp') {
                newItem = new Expense(Id, des, val);    
            } else if (type === 'inc') {
                newItem = new Income(Id, des, val);
            }
            // pusing new Items in array
            data.allItems[type].push(newItem);
            //return new Item
            return newItem;
        },
        deleteItems: function (type,id) {
            var ids,index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function () {
            calculateTotal('inc');
            calculateTotal('exp');
            //return budget
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage;
            }
        },
        calculatePercentage: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            var allperc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allperc;
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                totalPercentage:data.percentage,
            }
        },
        testing: function () {
            console.log(data);
        }
    }

})();

// UI CONTROLLER
var uiController = (function () {

    //some code
    var Domstring = {
        inputType: '.add__type',
        inputDec: '.add__description',
        inputValue: '.add__value',
        inputBtn: ".add__btn",
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };
    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + ' ' + int +'.' + dec;
    };
    var nodeListForEach = function (list, callBack) {
        for (var i = 0; i < list.length; i++) {
            callBack(list[i], i);
        }
    };
    return {
        getInput: function () {
            return {
                type: document.querySelector(Domstring.inputType).value,
                description: document.querySelector(Domstring.inputDec).value,
                value: parseFloat(document.querySelector(Domstring.inputValue).value),
            }
        },
        addListItem : function (obj, type) {
            //html strings
            var html, element,newHtml;
            if (type === 'inc') {
                element = Domstring.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = Domstring.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class = "item__description" > %description% </div> <div class = "right clearfix" ><div class = "item__value" >%value%</div><div class = "item__percentage" > 21 % </div><div class = "item__delete" ><button class = "item__delete--btn"><i class = "ion-ios-close-outline" ></i></button ></div></div></div>'
            }
            
            //replace the placeholder with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            //Insert html in to the Dom
        },
        deleteListItem: function (selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        clearFields: function () {
            var fields, fieldArr;
            fields = document.querySelectorAll(Domstring.inputDec + ',' + Domstring.inputValue);

            fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach((current,index,array) => {
                current.value = '';
            });
            fieldArr[0].focus();
        },
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(Domstring.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(Domstring.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(Domstring.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');

            if (obj.totalPercentage > 0) {
                document.querySelector(Domstring.percentageLabel).textContent = obj.totalPercentage + '%';
            } else {
                document.querySelector(Domstring.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(Domstring.expensePercLabel);
            
            nodeListForEach(fields, function (current,index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.percentages = '---';
                }
            })
        },
        displayMonth: function () {
            var now, month, year, months;
            now = new Date();
            months = ['January','February','March','April',"May",'Jume','July','August','September','October','November','December']
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(Domstring.dateLabel).textContent = months[month] + ' ' + year;
        },
        changedType: function () {
            var fields = document.querySelectorAll(Domstring.inputType + ',' + Domstring.inputDec + ',' + Domstring.inputValue);
            
            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(Domstring.inputBtn).classList.toggle('red');
        },
        getDomStrings: function () {
            return Domstring;
        }
    }

})();


// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, uiCtrl) {

    var setEventListener = function () {
        var Dom = uiCtrl.getDomStrings();
        document.querySelector(Dom.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(Dom.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(Dom.inputType).addEventListener('change', uiCtrl.changedType);
    };

    var updateBudget = function () {
        //calculate and update budget
        budgetCtrl.calculateBudget();
        //return budget
        var budget = budgetCtrl.getBudget();
        //update budget to ui
        uiCtrl.displayBudget(budget);
    }

    //some code
    var ctrlAddItem = function () {
        var input,newItem;
        // get input field values
        input = uiCtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
             // add items to budgetController
             newItem = budgetCtrl.addItems(input.type, input.description, input.value);
             // add items to the ui
             uiCtrl.addListItem(newItem, input.type);
             // clear fields
             uiCtrl.clearFields();
             // calculate & update the budget
            updateBudget();
            //update percentages
            updatePercentages();
        }
    };
    var updatePercentages = function () {
        budgetCtrl.calculatePercentage();  
        var percentages = budgetCtrl.getPercentages();
        uiCtrl.displayPercentages(percentages);
    };
    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, ID;
        
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {

            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
            //delete item from the data structure
            budgetCtrl.deleteItems(type, ID);

            //delete from the ui
            uiCtrl.deleteListItem(itemId);

            //update the total budget in ui
            updateBudget();
            //update percentages
            updatePercentages();
        }
    };
    return {
        init: function () {
            console.log("application is started");
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                totalPercentage: -1,
            });
            uiCtrl.displayMonth();
            setEventListener();
        }
    }


})(budgetController, uiController);
controller.init();