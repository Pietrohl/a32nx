import { EventBus, EventSubscriber, SimVarDefinition, SimVarPublisher, SimVarValueType } from 'msfssdk';

interface AtcMessageButtonSimvars {
    msfsButtonActive: boolean,
    msfsButtonPressed: number,
}

enum AtcMessageButtonSimvarSources {
    buttonActive = 'L:A32NX_DCDU_ATC_MSG_WAITING',
    buttonPressed = 'L:A32NX_DCDU_ATC_MSG_ACK',
}

export class AtcMessageButtonSimvarPublisher extends SimVarPublisher<AtcMessageButtonSimvars> {
    private static simvars = new Map<keyof AtcMessageButtonSimvars, SimVarDefinition>([
        ['msfsButtonActive', { name: AtcMessageButtonSimvarSources.buttonActive, type: SimVarValueType.Bool }],
        ['msfsButtonPressed', { name: AtcMessageButtonSimvarSources.buttonPressed, type: SimVarValueType.Number }],
    ]);

    public constructor(bus: EventBus) {
        super(AtcMessageButtonSimvarPublisher.simvars, bus);
    }
}

export interface AtcMessageButtonBusTypes {
    buttonActive: boolean,
    buttonPressed: boolean,
}

export type AtcMessageButtonBusCallbacks = {
    onButtonPressed: () => void;
}

export class AtcMessageButtonInputBus {
    private simVarPublisher: AtcMessageButtonSimvarPublisher = null;

    private subscriber: EventSubscriber<AtcMessageButtonSimvars>;

    private buttonActive: boolean = false;

    private callbacks: AtcMessageButtonBusCallbacks = { onButtonPressed: null }

    constructor(private readonly bus: EventBus) {
        this.simVarPublisher = new AtcMessageButtonSimvarPublisher(this.bus);
    }

    public initialize(): void {
        this.subscriber = this.bus.getSubscriber<AtcMessageButtonSimvars>();

        this.subscriber.on('msfsButtonActive').whenChanged().handle((active: boolean) => this.buttonActive = active);
        this.subscriber.on('msfsButtonPressed').whenChanged().handle((pressed: number) => {
            if (pressed) {
                if (this.buttonActive && this.callbacks.onButtonPressed !== null) {
                    this.callbacks.onButtonPressed();
                }

                SimVar.SetSimVarValue(AtcMessageButtonSimvarSources.buttonPressed, 'Number', 0);
            }
        });
    }

    public connectedCallback(): void {
        this.simVarPublisher.subscribe('msfsButtonActive');
        this.simVarPublisher.subscribe('msfsButtonPressed');
    }

    public addDataCallback<K extends keyof AtcMessageButtonBusCallbacks>(event: K, callback: () => void): void {
        this.callbacks[event] = callback;
    }

    public startPublish(): void {
        this.simVarPublisher.startPublish();
    }

    public update(): void {
        this.simVarPublisher.onUpdate();
    }
}

export class AtcMessageButtonOutputBus {
    constructor(private readonly bus: EventBus) { }

    public activateButton(): void {
        SimVar.SetSimVarValue(AtcMessageButtonSimvarSources.buttonActive, 'Bool', true);
    }

    public resetButton(): void {
        SimVar.SetSimVarValue(AtcMessageButtonSimvarSources.buttonActive, 'Bool', false);
        SimVar.SetSimVarValue(AtcMessageButtonSimvarSources.buttonPressed, 'Number', 0);
    }
}
