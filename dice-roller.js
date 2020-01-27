'use strict';

class DiceRoll {
    constructor(dice, modifier=null) {
        this.dice = {};
        this.modifier = modifier;
        for(let sides in dice){
            if(this.dice[sides] === undefined)
                this.dice[sides] = [];

            for(let i = 0; i < dice[sides]; i++)
                this.dice[sides].push(Math.floor(Math.random() * sides) + 1);
        }
    }

    toString(html=false) {
        let sides_list = Object.keys(this.dice),
            total = 0,
            str = '';
        
        for(let i = 0; i < sides_list.length; i++){
            let sides = sides_list[i],
                dice = this.dice[sides],
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
        str += `Total: ${total}`;
        if(this.modifier !== null) str += ` ${this.modifier < 0 ? '-' : '+'} ${this.modifier} = ${total + this.modifier}`;
        if(html) str += '</span>';
        return str;
    }
}

class DiceRoller {
    constructor() {
        this.dice = {};
        this.modifier = 0;
        this.history = [];
    }

    addDie(sides) {
        if(sides < 1){
            console.error('[Die error] Invalid number of sides (input: ' + sides + ')');
        }else{
            if(this.dice[sides] === undefined)
                this.dice[sides] = 0;
            this.dice[sides] += 1;
        }
    }

    removeDie(sides) {
        if(this.dice[sides] === undefined || this.dice[sides] < 1) return;
        this.dice[sides] -= 1;
    }

    setModifier(n) { this.modifier = n; }

    removeModifier() { this.modifier = null; }

    clearDice() { this.dice = []; }

    clearHistory() { this.history = []; }

    roll() {
        if(Object.keys(this.dice).length < 1) return null;
        let roll = new DiceRoll(this.dice, this.modifier);
        this.history.unshift(roll);
        return roll;
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

    toHTML(i=-1) { return this.toString(i, true); }
}

const RLLR = new DiceRoller();
const UI = {
    elems: {
        mod: document.querySelector('#dice input'),
        set: document.querySelector('#set'),
        out: document.querySelector('#readout'),
        nav: document.querySelector('nav'),
        screen: document.querySelector('#screen')
    },

    addDie(sides) {
        RLLR.addDie(sides);
        this.render();
    },

    removeDie(sides) {
        RLLR.removeDie(sides);
        this.render();
    },

    setModifier() {
        if(this.elems.mod.reportValidity() && this.elems.mod.value !== '')
            RLLR.setModifier(Number.parseInt(this.elems.mod.value));
        else
            RLLR.removeModifier();
    },

    rollDice() {
        this.setModifier(this.elems.mod.value);
        RLLR.roll();
        this.render();
    },

    clearDice() {
        RLLR.clearDice();
        this.render();
    },

    clearHistory() {
        RLLR.clearHistory();
        this.render();
    },

    toggleMenu() {
        this.elems.nav.classList.toggle('open');
        this.elems.screen.classList.toggle('on');
    },

    render() {
        let html = '';
        for(let d in RLLR.dice){
            if(RLLR.dice[d] > 0)
                html += `<div onclick="UI.removeDie(${d})">` +
                        `${RLLR.dice[d]} <span>×</span> <span class="die d${d}"></span></div>`;
        }
        this.elems.set.innerHTML = html;
        this.elems.out.innerHTML = RLLR.toHTML();
    }
};