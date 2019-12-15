class NotificationComposer {

    constructor() {
        this.domObj = document.getElementById("notification");
        this.domText = document.getElementById("notification_text");
    }

    /**
     * Publish a notification
     *
     * @param message The message of the notification
     */
    notify(message) {
        if (this.currentMsg) {
            this.hide()
                .then(() => this.displayMsg(message));
        } else {
            this.displayMsg(message);
        }
    }

    displayMsg(message) {
        this.currentMsg = message;
        this.domText.innerText = message;

        this.show()
            .then(() => {
                setTimeout(() => {
                    if (this.currentMsg !== message) return;
                    this.currentMsg = undefined;
                    this.hide();
                }, 1000);
            });
    }


    show() {
        this.domObj.style.display = "flex";

        return new Promise((resolve, _) => {
            if (this.domObj.style.opacity > 0) {
                resolve();
                return;
            }


            let alpha = 0;
            const timer = setInterval(() => {
                if (alpha >= 1) {
                    clearInterval(timer);
                    resolve();
                }

                this.domObj.style.opacity = alpha.toString();
                this.domObj.style.filter = `alpha(opacity=${alpha * 100})`;
                alpha += 0.2;
            }, 10);
        });
    }

    hide() {
        return new Promise((resolve, _) => {
            if (this.currentMsg || this.domObj.style.opacity < 1) {
                resolve();
                return;
            }

            let alpha = 1;
            const timer = setInterval(() => {
                if (alpha <= 0) {
                    clearInterval(timer);
                    resolve();
                }

                this.domObj.style.opacity = alpha.toString();
                this.domObj.style.filter = `alpha(opacity=${alpha * 100})`;
                alpha -= 0.1;
            }, 10);
        });
    }
}