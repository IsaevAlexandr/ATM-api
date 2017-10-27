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

        this.cash = {
            '+5000': 0,
            '+1000': 10,
            '+500': 1,
            '+100': 2,
            '+50': 5
        }


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

    // showDetails() {
    //     return this.isCardInserted() ?
    //         this.view.showDetails(this) :
    //         this.view.showMessage(this);
    // }

    // getLastMessage() {
    //     return this.view.showMessage(this);
    // }
    // getBalance() {
    //     return this.isCardInserted() ?
    //         this.view.showBalance(this) :
    //         this.view.showMessage(this);
    // }

    putMoney(value) {
        if (this.isCardInserted() && value && typeof value === 'number') {

            return this.account.balance += value;
        } else {
            return this.messages.push({ date: new Date().toLocaleString(), message: 'error with put money!' });
        }
    }
    removeMoneyFromATMCash(obj) {
        for (let i in obj) {

            this.cash[i] -= obj[i]
        }
    }
    addMoneyToATMCash(obj) {
        for (let i in obj) {
            this.cash[i] += obj[i]
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
            return this.messages.push({ date: new Date().toLocaleString(), message: 'incorrect card or pin, check you card and try again' });
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
     * Метод 
     * 
     * @param {Number} value
     * @return {Object} denomination - 
     */
    findMoneyDenomination(value) {
        if (typeof value === 'number') {
            if (this.isSummCorrect(value)) {
                let tmpValue = value,
                    denomination = {};
                /* проходим по ключам объекта. нам важен порядок ключей, поэтому ключи впредставлены в виде строкогого значения ('+...') */
                for (let i in this.cash) {
                    /* получаем количество купюр  (+i - преобразуем значение в число) */
                    denomination[i] = Math.floor(tmpValue / +i);
                    /* получаем остаток от деления */
                    tmpValue = tmpValue % +i;
                    /* если количество купюр больше, чем есть в банкомате */
                    if (denomination[i] > this.cash[i]) {
                        /* в промежуточное число добавляем недостающую сумму, а количество купюр берем из ниличия в банкомате */
                        tmpValue = tmpValue % +i + ((denomination[i] - this.cash[i]) * +i);
                        denomination[i] = this.cash[i];
                    }
                }
                /* если остается остаток, значит в банкомате не хватает средст, возвращаем сообщение об ошибке */
                if (tmpValue === 0) {
                    return denomination;
                } else {
                    this.messages.push({ date: new Date().toLocaleString(), message: 'В банкомате не хватает средств!' })
                }
            }

        }
    }

    /**
     * метод проверяем возможность выдать сумму без сдачи
     * 
     * @param {Number} value
     * @return {Boolean || Object} 
     */
    isSummCorrect(value) {
        if (value > 0) {
            let cashKeysArray = Object.keys(this.cash);
            let lastNominal = +cashKeysArray[cashKeysArray.length - 1];
            if (value % lastNominal === 0) {
                return true;
            } else {
                this.messages.push({ date: new Date().toLocaleString(), message: `невозможно выдать указанную сумму. Сумма должна быть кратна ${lastNominal}` })
                return false;
            }
        } else {
            this.messages.push({ date: new Date().toLocaleString(), message: `Сумма должна быть положительной` })
            return false;
        }

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

console.log(atm.findMoneyDenomination(1450));