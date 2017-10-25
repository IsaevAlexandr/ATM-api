class View {
    showDetails(ATM) {
        return {
            balance: ATM.account.balance,
            cardNumbe: ATM.account.cardNumber,
            message: ATM.errorLog.length > 0 ? ATM.errorLog[ATM.errorLog.length - 1].message : 'Ошибок нет!'
        }
    }
    showBalance(ATM) {
        return ATM.account.balance;
    }
    insertCardMessage() {
        return { message: 'Please insert you card!' }
    }
    showErrors(ATM) {
        return { message: ATM.errorLog.length > 0 ? ATM.errorLog[ATM.errorLog.length - 1].message : 'Ошибок нет!' }
    }
}


/**
 * @class ATM 
 * class representing the realtization of the ATM, 
 * the view is made in a separate class
 */
class ATM {
    constructor(view = new View()) {

        this.view = view;
        this.account = null;
        this.errorLog = [];
        this.storage = [{
                cardNumber: '999',
                balance: 1000,
                pin: 1234
            },
            {
                cardNumber: '888',
                balance: 500,
                pin: 5678
            }
        ]
        return this;
    }

    showDetails() {
        if (this.isCardInserted()) {
            return this.view.showDetails(this);
        } else {
            return this.view.showErrors(this);
        }
    }

    getBalance() {
        return this.isCardInserted() ?
            this.view.showBalance(this) :
            this.view.insertCardMessage()
    }
    putMoney(value) {
        if (value && this.account && typeof value === 'number') {
            return this.account.balance += value;
        } else {
            return this.errorLog.push({ date: new Date().toLocaleString(), message: 'error with put money!' });
        }
    }
    getMoney(value) {
        if (this.isCardInserted()) {
            if (value) {
                if (value <= this.account.balance) {
                    return this.account.balance -= value;
                } else {
                    return this.errorLog.push({ date: new Date().toLocaleString(), message: 'the value is greater then you card balance' });
                }
            } else {
                {
                    return this.errorLog.push({ date: new Date().toLocaleString(), message: 'please enter the value' });
                }
            }

        } else {
            return this.errorLog.push({ date: new Date().toLocaleString(), message: 'Insert your card please to get you balance' });
        }
    }

    /**
     * Insert cart to ATM with simple validation
     * @param {Object} card 
     * @param {Number} pin 
     */
    insertCard(card, pin) {
        if (!this.account && card && pin) {
            return this.isCorrectCard(card.cardNumber, pin) ?
                this.account = card :
                this.errorLog.push({ date: new Date().toLocaleString(), message: 'incorrect card or pin, check you card and try again' });
        } else {
            this.errorLog.push({ date: new Date().toLocaleString(), message: 'incorrect card or pin, check you card and try again' });
            return false;
        }
    }

    /**
     * return card from ATM
     */
    returnCard() {
        this.resetErrorLog()
        return this.account = null;
    }

    /**
     * Check the presence of the card
     * @return {Boolean}
     */
    isCardInserted() {
        return !!this.account;
    }

    /**
     * adding card to ATM storage
     * @param {Object} card
     */
    addToStorage(card) {
        return card ?
            this.storage.push(card) :
            this.errorLog.push({ date: new Date().toLocaleString(), message: 'You must enter any object to store it!' })
    }

    /**
     * Simple card validator
     * Need to make separate class later
     * 
     * @param {String} cardNumber 
     * @param {Number} pin 
     * @return {Boolean}
     */
    isCorrectCard(cardNumber, pin) {
        let tmpCard = this.storage.find(card => card.cardNumber === cardNumber);
        if (tmpCard) {
            if (tmpCard.pin === pin) {
                return true;
            }
        } else {
            return false;
        }
    }

    resetErrorLog() {
        return this.errorLog = [];
    }

}

class Card {
    constructor(cardNumber, balance, pin) {
        this.cardNumber = cardNumber;
        this.balance = balance;
        this.pin = pin;
        return this;
    }
}

let myCard = new Card('1234', 846, 555);
// let view = new View();
let atm = new ATM();
console.log(atm.showDetails());
/* добавим нашу карту в память банкомата */
atm.addToStorage();
console.log(atm.showDetails());
atm.addToStorage(myCard);
console.log(atm.showDetails());
/* Пробуем ввести неверный пин */
console.log(atm.getBalance());
atm.insertCard(myCard, 55)
console.log(atm.showDetails());


atm.insertCard(myCard, 555)
console.log(atm.showDetails());
atm.putMoney(500);
console.log(atm.showDetails());


/* Вводим верные данные */
atm.getMoney(300);
console.log(atm.showDetails());
atm.returnCard();
console.log(atm.showDetails());
atm.insertCard();
console.log(atm.showDetails());