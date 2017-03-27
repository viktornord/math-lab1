const
    EPSILON = 1e-6,
    initialMatrix = [
        [4.3, -12.1, 23.2, -14.1],
        [2.4, -4.4, 3.5, 5.5],
        [5.4, 8.3, -7.4, -12.7],
        [6.3, -7.6, 1.34, 3.7]
    ],
    initialVector = [15.5, 2.5, 8.6, 12.1],
    roots = [],
    deltas = {
        kub: [null],
        sf: [null],
        okt: [null]
    },
    data = {
        calculated: false,
        gSHvilkoy: null,
        matrix: initialMatrix,
        vector: initialVector,
        roots,
        deltas,
    };

const app = new Vue({
    el: '#app',
    data,
    methods: {
        calculate() {
            const transposedMatrix = math.transpose(initialMatrix);
            const multipliedMatrix = math.multiply(transposedMatrix, initialMatrix);
            data.matrix = multipliedMatrix.map((row, rowIndex) => {
                return row.map(el => el / row[rowIndex]);
            });
            data.vector = math.multiply(transposedMatrix, initialVector).map((el, index) => {
                return el / multipliedMatrix[index][index];
            });

            data.gSHvilkoy = data.matrix.map((row, rowIndex) => {
                return row.map((el, index) => rowIndex === index ? 0 : -el);
            });

            roots.push(calculateRoot());

            // for (let i = 0; i < 5; i++) {
            while (!isEpsilonReached(getLastDelta('sf')) || !isEpsilonReached(getLastDelta('okt')) || !isEpsilonReached(getLastDelta('kub'))) {
                const lastRootVector = roots[roots.length - 1], newRootVector = calculateRoot();
                roots.push(newRootVector);
                !isEpsilonReached(getLastDelta('sf')) && deltas.sf.push(Math.sqrt(newRootVector.reduce((deltaValue, rootValue, index) => {
                    return deltaValue + (rootValue - lastRootVector[index]) ** 2;
                }, 0)));
                !isEpsilonReached(getLastDelta('okt')) && deltas.okt.push(newRootVector.reduce((deltaValue, rootValue, index) => {
                    return deltaValue + Math.abs(rootValue - lastRootVector[index]);
                }, 0));
                !isEpsilonReached(getLastDelta('kub')) && deltas.kub.push(Math.max(...newRootVector.map((rootValue, index) => {
                    return Math.abs(rootValue - lastRootVector[index]);
                }, 0)));
            }
            console.log('Sf na kroci ', deltas.sf.length, ' = ', roots[deltas.sf.length - 1]);
            console.log('Okt na kroci ', deltas.okt.length, ' = ', roots[deltas.okt.length - 1]);
            console.log('Kub: na kroci ', deltas.kub.length, ' = ', roots[deltas.kub.length - 1]);
            data.calculated = true;
        },
        reset() {
            data.matrix = initialMatrix;
            data.vector = initialVector;
            data.calculated = false;
            roots.length = 0;
            deltas.sf.length = deltas.okt.length = deltas.kub.length = 0;
        }
    }
});

function getLastDelta(deltaType) {
    return deltas[deltaType][deltas[deltaType].length - 1];
}

function isEpsilonReached(delta) {
    return delta && delta < EPSILON;
}

function calculateRoot() {
    const lastRootVector = roots[roots.length - 1] || new Array(4).fill(0);
    const newRootVector = [];
    data.gSHvilkoy.forEach((row, rowIndex) => {
        newRootVector.push(row.reduce((newRootValue, el, index) => {
                return newRootValue + (el * (newRootVector[index] || lastRootVector[index]));
            }, 0) + data.vector[rowIndex]);

    });
    return newRootVector;
}