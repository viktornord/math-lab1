const
    EPSILON = 1e-6,
    initialMatrix = [
        [12.5, 1.2, 2.3, 0.7],
        [1.2, 10, 1.5, 2.9],
        [1.1, 1.3, 11.2, 1.3],
        [0.7, 2, 3.1, 15]
    ],
    initialVector = [6.2, 5.84, 10.3, -5.8],
    roots = [],
    deltas = {
        kub: [null],
        sf: [null],
        okt: [null]
    },
    data = {
        calculated: false,
        aSHvilkoy: null,
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
            const divisionVector = initialMatrix.map(row => Math.max(...row));
            data.matrix = initialMatrix.map((row, rowIndex) => {
                return row.map(el => el / row[rowIndex]);
            });
            data.vector = initialVector.map((el, index) => el / initialMatrix[index][index]);

            roots.push([...data.vector]);

            data.aSHvilkoy = data.matrix.map((row, rowIndex) => {
                return row.map((el, index) => rowIndex === index ? 0 : -el);
            });

            while (!isEpsilonReached(getLastDelta('sf')) || !isEpsilonReached(getLastDelta('okt')) || !isEpsilonReached(getLastDelta('kub'))) {
                const lastRootVector = roots[roots.length - 1];
                const newRootVector = data.aSHvilkoy.map((row, rowIndex) => {
                    return row.reduce((newRootValue, el, index) => {
                            return newRootValue + (el * lastRootVector[index]);
                        }, 0) + data.vector[rowIndex];
                });
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