'use strict';

class Die {
    constructor(sides) {
        this.sides = sides;
        this.result = 0;
    }

    roll() {
        this.result = Math.floor(Math.random() * this.sides) + 1;
        return this.result;
    }

    toString() {
        return `d${this.sides}: ${this.result}`;
    }
}

class DiceRoll {
    constructor(dice, modifier) {
        this.roll = {};
        this.modifier = modifier;
        dice.forEach(die => {
            if(this.roll[die.sides] === undefined)
                this.roll[die.sides] = [];
            this.roll[die.sides].push(die.roll());
        });
    }

    toString(html=false) {
        let nums = Object.keys(this.roll),
            total = 0,
            str = '';
        
        for(let i = 0; i < nums.length; i++){
            let sides = nums[i],
                dice = this.roll[sides],
                sum = 0;
            str += `${dice.length}d${sides}: `;
            for(let j = 0; j < dice.length; j++){
                str += dice[j] + (j < dice.length-1 ? ', ' : ' ');
                sum += dice[j];
            }
            if(dice.length > 1) str += `(${sum})`;
            str += '\n';
            total += sum;
        }
        if(html) str += '<span class="total">';
        str += `Total: ${total} ${this.modifier < 0 ? '-' : '+'} ${this.modifier} = ${total + this.modifier}`;
        if(html) str += '</span>';
        return str;
    }
}

class DiceRoller {
    constructor() {
        this.dice = [];
        this.modifier = 0;
        this.history = [];
    }

    addDie(sides) {
        if(sides < 1) console.error('[Die error] Invalid number of sides (input: ' + sides + ')');
        else this.dice.push(new Die(sides));
    }

    removeDie(sides) {
        for(let i in this.dice){
            if(this.dice[i].sides === sides){
                this.dice.splice(i, 1);
                break;
            }
        }
    }

    setModifier(n) {
        this.modifier = n;
    }

    roll() {
        if(this.dice.length < 1) return null;
        let roll = new DiceRoll(this.dice, this.modifier);
        this.history.unshift(roll);
        return roll;
    }

    clearDice() {
        this.dice = [];
    }

    clearHistory() {
        this.history = [];
    }

    toHTML(i=-1) {
        return this.toString(i, true);
    }

    toString(i=-1, html=false) {
        if(i < 0) i = this.history.length;
        let str = '';
        for(let j = 0; j < i; j++){
            str += this.history[j].toString(html);
            if(j < i - 1) str += (html ? '<hr/>' : '\n-------\n');
        }
        return str;
    }
}

const RLLR = new DiceRoller();

const UI = {
    elems: {
        set: document.querySelector('#set'),
        out: document.querySelector('#readout')
    },

    addDie(sides) {
        RLLR.addDie(sides);
        this.render();
    },

    removeDie(sides) {
        RLLR.removeDie(sides);
        this.render();
    },

    rollDice() {
        RLLR.roll();
        this.render();
    },

    clearDice() {
        RLLR.clearDice();
        this.render();
    },

    render() {
        let html = '';
        let dice = RLLR.dice.sort((a,b) => a.sides - b.sides);
        RLLR.dice.forEach(die => html += `<div class="die d${die.sides} small" onclick="UI.removeDie(${die.sides})"></div>`);
        this.elems.set.innerHTML = html;
        this.elems.out.innerHTML = RLLR.toHTML();
    }
};