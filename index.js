/**
 * @class ATM 
 * class representing the realtization of the ATM, 
 * the view is made in a separate class
 */
class ATM {
    constructor() {

        this.account = null;
        this.messages = [];
        /* Данные представлены в таком виде, потому что нам важен порядок ключей в объекте */
        this.cash = {
            '+5000': 0,
            '+1000': 10,
            '+500': 1,
            '+100': 2,
            '+50': 5
        }
        this.storage = [
            { cardNumber: '999', balance: 1000, pin: 1234 },
            { cardNumber: '888', balance: 500, pin: 5678 }
        ]

        return this;
    }

    /**
     * Метод добавляет деньги в банкомат и на счет карты
     * @param {Object} value 
     */
    putMoney(value) {
        if (this.isCardInserted()) {
            console.log(1);
            if (typeof value === 'object') {
                this.account.balance += this.summToNumber(value);
                this.addMoneyToATMCash(value);
            } else {
                this.messages.push({ date: new Date().toLocaleString(), message: 'Не правильный формат денег!' });
            }
        } else {
            this.messages.push({ date: new Date().toLocaleString(), message: 'Необходимо вставить карту для совершения действия с деньгами' });
        }

    }

    summToNumber(obj) {
        let sum = 0,
            i;
        for (i in obj) {
            sum += obj[i] * +i;
        }
        return sum;
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
            console.log(1);
            // console.log(1);
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
     * Метод проверяет возможно ли набрать сумму из имеющихся в банкомате купюр
     * @param {Number} value
     * @return {Object}  
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
                    return this.messages.push({ date: new Date().toLocaleString(), message: 'В банкомате не хватает средств!' })
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
// console.log(atm.account);
// console.log(atm.messages);
atm.addToStorage(myCard);
atm.insertCard(myCard, 555);
// console.log(atm.messages);
// console.log(atm.account);
// console.log(atm.cash)
atm.putMoney({ '+5000': 1 });
console.log(atm.cash)
    // console.log(atm.findMoneyDenomination(2450));