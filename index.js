/**
 * @class Message
 */
class Message {
    constructor(message) {
        this.date = new Date().toLocaleString();
        this.message = message;
        return this;
    }
}

/**
 * @class Card
 */
class Card {
    constructor(cardNumber, balance, pin) {
        this.cardNumber = cardNumber;
        this.balance = balance;
        this.pin = pin;
        return this;
    }
}

/**
 * @class ATM 
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
     * Сообщаем экземпляру объекта банкомата о карте
     * (доп. проверки не реализованы)
     * @param {Object} card
     */
    addCardToStorage(card) {
        return card ?
            this.storage.push(card) :
            this.messages.push(new Message('Необходимо указать карту'))
    }

    /**
     * Вставить карту в банкомат
     * @param {Object} card 
     * @param {Number} pin 
     */
    insertCard(card, pin) {
        if (!this._isCardInserted()) {
            if (typeof card === 'object' && typeof pin === 'number') {
                return this._isCorrectCard(card.cardNumber, pin) ?
                    this.account = card :
                    this.messages.push(new Message('Не правильный pin код'));
            }
        } else {
            return this.messages.push(new Message('В банкомате уже находится карта'));
        }
    }

    /**
     * Метод добавляет деньги в банкомат и на счет карты
     * @param {Object} MoneyObject
     */
    putMoney(MoneyObject) {
        if (this._isCardInserted()) {
            console.log(1);
            if (typeof MoneyObject === 'object') {
                this.account.balance += this._convertMoneyToNumber(MoneyObject);
                this._addMoneyToATMCash(MoneyObject);
            } else {
                this.messages.push(new Message('Не правильный денежный формат!'));
            }
        } else {
            this.messages.push(new Message('Необходимо вставить карту для совершения действия с деньгами'));
        }
    }

    /**
     * В разработке
     * @param {Number} value 
     */
    getMoney(value) {
        if (this._isCardInserted()) {
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
     * Вернуть карту из банкомата
     */
    returnCard() {
        this.account = null;
    }

    resetmessages() {
        return this.messages = [];
    }


    /**
     * Преобразует деньги из представления объекта в числовое значение
     * @param {Object} MoneyObject 
     * @return {Number} value
     */
    _convertMoneyToNumber(MoneyObject) {
        let value = 0,
            i;
        for (i in MoneyObject) {
            value += MoneyObject[i] * +i;
        }
        return value;
    }

    _removeMoneyFromATMCash(MoneyObject) {
        for (let i in MoneyObject) {
            this.cash[i] -= MoneyObject[i]
        }
    }

    _addMoneyToATMCash(MoneyObject) {
        for (let i in MoneyObject) {
            this.cash[i] += MoneyObject[i]
        }
    }

    /**
     * Проверяем вставлена ли карта
     * @return {Boolean}
     */
    _isCardInserted() {
        return !!this.account;
    }

    /**
     * Метод проверяет возможно ли набрать сумму из имеющихся в банкомате купюр
     * @param {Number} value
     * @return {Object}  
     */
    _findMoneyDenomination(value) {
        if (typeof value === 'number') {
            if (this._isSummCorrect(value)) {
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
                    return this.messages.push(new Message('В банкомате не хватает средств!'));
                }
            }
        }
    }

    /**
     * Проверка возможности выдать указанную сумму без сдачи
     * @param {Number} value
     * @return {Boolean || Object} 
     */
    _isSummCorrect(value) {
        if (value > 0) {
            let cashKeysArray = Object.keys(this.cash);
            let lastNominal = +cashKeysArray[cashKeysArray.length - 1];
            if (value % lastNominal === 0) {
                return true;
            } else {
                this.messages.push(new Message(`невозможно выдать указанную сумму. Сумма должна быть кратна ${lastNominal}`))
                return false;
            }
        } else {
            this.messages.push(new Message('Сумма должна быть положительной'));
            return false;
        }

    }

    /**
     * Проверка пин кода карты
     * @param {String} cardNumber 
     * @param {Number} pin 
     * @return {Boolean}
     */
    _isCorrectCard(cardNumber, pin) {
        let tmpCard = this.storage.find(card => card.cardNumber === cardNumber);
        if (tmpCard) {
            if (tmpCard.pin === pin) {
                return true;
            }
        } else {
            return false;
        }
    }
}



let myCard = new Card('1234', 846, 555);
let atm = new ATM();
// console.log(atm.account);
// console.log(atm.messages);
atm.addCardToStorage(myCard);
atm.insertCard(myCard, 555);
console.log(atm.messages);
// console.log(atm.account);
// console.log(atm.cash)
atm.putMoney({ '+5000': 1 });
console.log(atm.cash)
    // console.log(atm.findMoneyDenomination(2450));