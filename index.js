class View {
    showDetails(ATM) {
        return { balance: ATM.account.balance, cardNumber: ATM.account.cardNumber }
    }
    showBalance(ATM) {
        return ATM.account.balance;
    }
    showMessage(ATM) {
        return { message: ATM.messages.length > 0 ? ATM.messages[ATM.messages.length - 1].message : 'Please insert you card to see details' }
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
        this.messages = [];
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
        return this.isCardInserted() ?
            this.view.showDetails(this) :
            this.view.showMessage(this);
    }


    getBalance() {
        return this.isCardInserted() ?
            this.view.showBalance(this) :
            this.view.showMessage(this);
    }
    putMoney(value) {
        if (this.isCardInserted() && value && typeof value === 'number') {
            return this.account.balance += value;
        } else {
            return this.messages.push({ date: new Date().toLocaleString(), message: 'error with put money!' });
        }
    }
    getMoney(value) {
        if (this.isCardInserted()) {
            if (value) {
                if (value <= this.account.balance) {
                    return this.account.balance -= value;
                } else {
                    return this.messages.push({ date: new Date().toLocaleString(), message: 'the value is greater then you card balance' });
                }
            } else {
                {
                    return this.messages.push({ date: new Date().toLocaleString(), message: 'please enter the value' });
                }
            }
        } else {
            return this.messages.push({ date: new Date().toLocaleString(), message: 'Insert your card please to get you balance' });
        }
    }

    /**
     * Insert cart to ATM with simple validation
     * @param {Object} card 
     * @param {Number} pin 
     */
    insertCard(card, pin) {
        if (!this.isCardInserted() && card && pin) {
            return this.isCorrectCard(card.cardNumber, pin) ?
                this.account = card :
                this.messages.push({ date: new Date().toLocaleString(), message: 'incorrect card or pin, check you card and try again' });
        } else {
            this.messages.push({ date: new Date().toLocaleString(), message: 'incorrect card or pin, check you card and try again' });
            return false;
        }
    }

    /**
     * return card from ATM
     */
    returnCard() {
        this.resetmessages();
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
     * 
     * -need to validate this
     * @param {Object} card
     */
    addToStorage(card) {
        return card ?
            this.storage.push(card) :
            this.messages.push({ date: new Date().toLocaleString(), message: 'You must enter any object to store it!' })
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

    resetmessages() {
        return this.messages = [];
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
let atm = new ATM();
/* пробуем добавить карту в хранилище, не передавая аргументов */
atm.addToStorage();
console.log(atm.showDetails());

/* добавляем карту в хранилище */
atm.addToStorage(myCard);

/* пробуем ввести некорректный пин */
atm.insertCard(myCard, 55)
console.log(atm.showDetails());

/* Вводим правельные данные */
atm.insertCard(myCard, 555)
console.log(atm.showDetails());

/* кладем деньги на счет */
atm.putMoney(500);
console.log(atm.showDetails());

/* снимаем деньги */
atm.getMoney(300);
console.log(atm.showDetails());

/* возвращаем карту */
atm.returnCard();
console.log(atm.showDetails());

/* пробуем вызвать команту не передавая аргументов */
atm.insertCard();
console.log(atm.showDetails());

/* вставляем карту, данные о которой есть в хранилище */
atm.insertCard({ cardNumber: '999', balance: 1000, pin: 1234 }, 1234)

console.log(atm.showDetails())
console.log(atm.getBalance())