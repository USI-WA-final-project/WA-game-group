class Editor {

    constructor() {

        var isDrawingCell = false;
        var isDrawingSpike = false;
        var isDrawingShield = false;
        var isDrawingBounce = false;

        // events to handle buying and selling
        const bodyBtn = document.getElementById('cell');
        console.log(bodyBtn);
        bodyBtn.addEventListener('click', () => {
            // TODO call editing functions
            // unavailable until the editing functions are done

            // check if any other buttons have been pressed and reset their
            // status
            if (isDrawingSpike) isDrawingSpike = false;
            if (isDrawingShield) isDrawingShield = false;
            if (isDrawingBounce) isDrawingBounce = false;

            toggleBoolean(isDrawingCell);
            console.log(isDrawingCell);
        });

        const spikeBtn = document.getElementById('spike');
        spikeBtn.addEventListener('click', () => {
            // TODO call editing functions
            // unavailable until the editing functions are done

            // check if any other buttons have been pressed and reset their
            // status
            if (isDrawingCell) isDrawingCell = false;
            if (isDrawingShield) isDrawingShield = false;
            if (isDrawingBounce) isDrawingBounce = false;

            isDrawingSpike = toggleBoolean(isDrawingSpike);
            console.log(isDrawingSpike);
        });

        const shieldBtn = document.getElementById('shield');
        shieldBtn.addEventListener('click', () => {
            // TODO call editing functions
            // unavailable until the editing functions are done

            // check if any other buttons have been pressed and reset their
            // status
            if (isDrawingCell) isDrawingCell = false;
            if (isDrawingSpike) isDrawingSpike = false;
            if (isDrawingBounce) isDrawingBounce = false;

            toggleBoolean(isDrawingShield);
            console.log(isDrawingShield);
        });

        const bounceBtn = document.getElementById('bounce');
        bounceBtn.addEventListener('click', () => {
            // TODO call editing functions
            // unavailable until the editing functions are done

            // check if any other buttons have been pressed and reset their
            // status
            if (isDrawingCell) isDrawingCell = false;
            if (isDrawingSpike) isDrawingSpike = false;
            if (isDrawingShield) isDrawingShield = false;

            toggleBoolean(isDrawingBounce);
            console.log(isDrawingBounce);
        });
    }

    toggleBooleans(bool) {
        return bool ? false : true;
    }

    buildCell() {

    }
}
