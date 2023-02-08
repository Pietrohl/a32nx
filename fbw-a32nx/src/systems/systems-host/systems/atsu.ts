import { Atsu, DigitalInputs, DigitalOutputs } from '@atsu/system';
import { EventBus } from 'msfssdk';

export class AtsuSystem {
    private readonly digitalInputs: DigitalInputs;

    private readonly digitalOutputs: DigitalOutputs;

    private readonly atsu: Atsu;

    /**
     * "mainmenu" = 0
     * "loading" = 1
     * "briefing" = 2
     * "ingame" = 3
     */
    private gameState = 0;

    constructor(private readonly bus: EventBus) {
        this.digitalInputs = new DigitalInputs(this.bus);
        this.digitalOutputs = new DigitalOutputs(this.bus);
        this.atsu = new Atsu(this.digitalInputs, this.digitalOutputs);
    }

    public connectedCallback(): void {
        this.digitalInputs.initialize();
        this.digitalInputs.connectedCallback();
    }

    public startPublish(): void {
        this.digitalInputs.startPublish();
    }

    public update(): void {
        this.digitalInputs.update();
    }
}
