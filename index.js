/**
 * @class Message
 */
class Message {
    constructor(text) {
        this.date = new Date().toLocaleString();
        this.text = text;
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
    constructor(cashCapacity = 20) {

        this.account = null;
        this.messages = [];
        this.cashCapacity = cashCapacity;
        /* Данные представлены в таком виде, потому что нам важен порядок ключей в объекте */
        this.cash = {
            '+5000': 0,
            '+1000': 10,
            '+500': 1,
            '+100': 2,
            '+50': 5
        }
        this.storage = [
            { cardNumber: '999', balance: 10000, pin: 1234 },
            { cardNumber: '888', balance: 500, pin: 5678 }
        ]

        return this;
    }

    /**
     * Сообщаем экземпляру объекта банкомата о карте
     * @param {Object} newCard
     */
    addCardToStorage(newCard) {
        let isAlreadyInStorage = this.storage.find(card => card.cardNumber === newCard.cardNumber);
        if (!isAlreadyInStorage) {
            this.storage.push(newCard);
        } else {
            this.messages.push(new Message('Данные о карте уже есть в памяти!'))
        }

    }

    /**
     * Вставить карту в банкомат
     * @param {String} cardNumber
     * @param {Number} pin 
     */
    insertCard(cardNumber, pin) {
        if (!this._isCardInserted()) {
            if (typeof cardNumber === 'string' && typeof pin === 'number') {
                if (this._isCorrectCard(cardNumber, pin)) {
                    this.account = this.storage.find(card => card.cardNumber === cardNumber);
                } else {
                    this.messages.push(new Message('Не правильный pin код'));
                }
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
            if (typeof MoneyObject === 'object') {
                /* проверка вместимость хранилища для денег */
                if (this._getCashCapacity(MoneyObject) + this._getCashCapacity(this.cash) <= this.cashCapacity) {
                    this.account.balance += this._convertMoneyToNumber(MoneyObject);
                    this._addMoneyToATMCash(MoneyObject);
                } else {
                    this.messages.push(new Message('Невозможно положить деньги, картридж заполнен купюрами'));
                }
            } else {
                this.messages.push(new Message('Не правильный денежный формат!'));
            }
        } else {
            this.messages.push(new Message('Необходимо вставить карту для совершения действия с деньгами'));
        }
    }

    /**
     * Снять деньги со счета.
     * Реализованные проверки: 
     * -вставлена ли карта;
     * -является ли переданное значение числом;
     * -хватает ли денег на счете;
     * -можно ли выдать сумму имеющимися в наличии купюрами
     * @param {Number} value 
     */
    getMoney(value) {
        if (this._isCardInserted()) {
            if (typeof value === 'number' && this._isSummCorrect(value)) {
                if (value <= this.account.balance) {
                    let moneyObject = this._findMoneyDenomination(value)
                    if (moneyObject) {
                        this.account.balance -= value;
                        this._removeMoneyFromATMCash(moneyObject);
                    }
                } else {
                    this.messages.push(new Message('Не хватает денег на счете!'));
                }
            }
        } else {
            this.messages.push(new Message('Необходимо вставить карту для совершения действия с деньгами'));
        }
    }

    /**
     * Вернуть карту из банкомата
     */
    returnCard() {
        this.account = null;
    }

    resetmessages() {
        this.messages = [];
    }

    /**
     * возвращает количество купюр
     * @param {Object} MoneyObject
     * @return {Number}
     */
    _getCashCapacity(MoneyObject) {
        let count = 0;
        for (let i in MoneyObject) {
            count += MoneyObject[i];
        }
        return count;
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

    /**
     * Удалить деньги из банкомата
     * @param {Object} MoneyObject 
     */
    _removeMoneyFromATMCash(MoneyObject) {
        for (let i in MoneyObject) {
            this.cash[i] -= MoneyObject[i]
        }
    }

    /**
     * Добавить деньги в банкомат
     * @param {Object} MoneyObject 
     */
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
                    this.messages.push(new Message('В банкомате не хватает средств!'));
                    return -1;
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


// Добавляем данные о карте в память 
atm.addCardToStorage(myCard);
console.log(atm.messages);

// Пробуем еще раз добавить данные о той же карте 
atm.addCardToStorage(myCard);
console.log(atm.messages);
atm.resetmessages();

// пробуем ввести неверный pin код
atm.insertCard('1234', 55);
console.log(atm.messages);
atm.resetmessages();

// вводим правельные данные
atm.insertCard('1234', 555);

// Проверим баланс
console.log(atm.account.balance);

// пробуем снять деньги
atm.getMoney(451);
console.log(atm.messages);
atm.resetmessages();

// пробуем превысить баланс
atm.getMoney(900);
console.log(atm.messages);
atm.resetmessages();

// Пробуем снять отрицательную сумму
atm.getMoney(-100);
console.log(atm.messages);
atm.resetmessages();

// снимаем деньги со счета
atm.getMoney(400);
console.log(atm.account.balance);

// Кладен деньги на счет 
atm.putMoney({ '1000': 8 })
console.log(atm.account.balance);

// пробуем положить еще
atm.putMoney({ '1000': 1 })
console.log(atm.account.balance);
console.log(atm.messages);
atm.resetmessages();