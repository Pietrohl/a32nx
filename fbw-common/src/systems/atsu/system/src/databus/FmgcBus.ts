import { Arinc429Word } from '@shared/arinc429';
import { EventBus, EventSubscriber, Publisher, SimVarDefinition, SimVarPublisher, SimVarValueType } from 'msfssdk';

interface FmgcSimvars {
    msfsPresentPositionLatitude: number,
    msfsPresentPositionLongitude: number,
    msfsPresentAltitude: number,
    msfsPresentHeading: number,
    msfsPresentTrack: number,
    msfsComputedAirspeed: number,
    msfsPresentMach: number,
    msfsGroundSpeed: number,
    msfsVerticalSpeed: number,
    msfsAutopilotActive: boolean,
    msfsAutothrustMode: number,
    msfsAutothrustSelectedMach: number,
    msfsAutothrustSelectedKnots: number,
    msfsWindDirection: number,
    msfsWindSpeed: number,
    msfsStaticAirTemperature: number,
    msfsFlightPhase: number,
}

enum FmgcSimvarSources {
    presentPositionLatitude = 'L:A32NX_ADIRS_IR_1_LATITUDE',
    presentPositionLongitude = 'L:A32NX_ADIRS_IR_1_LONGITUDE',
    presentAltitude = 'L:A32NX_ADIRS_ADR_1_ALTITUDE',
    presentHeading = 'L:A32NX_ADIRS_IR_1_HEADING',
    presentTrack = 'L:A32NX_ADIRS_IR_1_TRACK',
    computedAirspeed = 'L:A32NX_ADIRS_ADR_1_COMPUTED_AIRSPEED',
    presentMach = 'L:A32NX_ADIRS_ADR_1_MACH',
    groundSpeed = 'L:A32NX_ADIRS_IR_1_GROUND_SPEED',
    verticalSpeed = 'L:A32NX_ADIRS_IR_1_VERTICAL_SPEED',
    autopilotActive = 'L:A32NX_AUTOPILOT_ACTIVE',
    autothrustMode = 'L:A32NX_AUTOTHRUST_MODE',
    autothrustSelectedMach = 'L:A32NX_MachPreselVal',
    autothrustSelectedKnots = 'L:A32NX_SpeedPreselVal',
    windDirection = 'L:A32NX_ADIRS_IR_1_WIND_DIRECTION',
    windSpeed = 'L:A32NX_ADIRS_IR_1_WIND_SPEED',
    staticAirTemperature = 'L:A32NX_ADIRS_ADR_1_STATIC_AIR_TEMPERATURE',
    flightPhase = 'L:A32NX_FMGC_FLIGHT_PHASE',
}

export class FmgcSimvarPuplisher extends SimVarPublisher<FmgcSimvars> {
    private static simvars = new Map<keyof FmgcSimvars, SimVarDefinition>([
        ['msfsPresentPositionLatitude', { name: FmgcSimvarSources.presentPositionLatitude, type: SimVarValueType.Number }],
        ['msfsPresentPositionLongitude', { name: FmgcSimvarSources.presentPositionLongitude, type: SimVarValueType.Number }],
        ['msfsPresentAltitude', { name: FmgcSimvarSources.presentAltitude, type: SimVarValueType.Number }],
        ['msfsPresentHeading', { name: FmgcSimvarSources.presentHeading, type: SimVarValueType.Number }],
        ['msfsPresentTrack', { name: FmgcSimvarSources.presentTrack, type: SimVarValueType.Number }],
        ['msfsComputedAirspeed', { name: FmgcSimvarSources.computedAirspeed, type: SimVarValueType.Number }],
        ['msfsPresentMach', { name: FmgcSimvarSources.presentMach, type: SimVarValueType.Number }],
        ['msfsGroundSpeed', { name: FmgcSimvarSources.groundSpeed, type: SimVarValueType.Number }],
        ['msfsAutopilotActive', { name: FmgcSimvarSources.autopilotActive, type: SimVarValueType.Number }],
        ['msfsAutothrustMode', { name: FmgcSimvarSources.autothrustMode, type: SimVarValueType.Number }],
        ['msfsAutothrustSelectedMach', { name: FmgcSimvarSources.autothrustSelectedMach, type: SimVarValueType.Number }],
        ['msfsAutothrustSelectedKnots', { name: FmgcSimvarSources.autothrustSelectedKnots, type: SimVarValueType.Number }],
        ['msfsWindDirection', { name: FmgcSimvarSources.windDirection, type: SimVarValueType.Number }],
        ['msfsWindSpeed', { name: FmgcSimvarSources.windSpeed, type: SimVarValueType.Number }],
        ['msfsStaticAirTemperature', { name: FmgcSimvarSources.staticAirTemperature, type: SimVarValueType.Number }],
        ['msfsFlightPhase', { name: FmgcSimvarSources.flightPhase, type: SimVarValueType.Number }],
    ]);

    public constructor(bus: EventBus) {
        super(FmgcSimvarPuplisher.simvars, bus);
    }
}

export interface FmgcDataBusTypes {
    flightNumber: string,
    presentPositionLatitude: Arinc429Word,
    presentPositionLongitude: Arinc429Word,
    presentAltitude: Arinc429Word,
    presentHeading: Arinc429Word,
    presentTrack: Arinc429Word,
    computedAirspeed: Arinc429Word,
    presentMach: Arinc429Word,
    groundSpeed: Arinc429Word,
    verticalSpeed: Arinc429Word,
    autopilotActive: Arinc429Word,
    autothrustMode: Arinc429Word,
    autothrustSelectedMach: Arinc429Word,
    autothrustSelectedKnots: Arinc429Word,
    windDirection: Arinc429Word,
    windSpeed: Arinc429Word,
    staticAirTemperature: Arinc429Word,
    flightPhase: Arinc429Word,
}

export class FmgcInputBus {
    private simVarPublisher: FmgcSimvarPuplisher = null;

    private publisher: Publisher<FmgcDataBusTypes> = null;

    private subscriber: EventSubscriber<FmgcSimvars> = null;

    constructor(private readonly bus: EventBus) {
        this.simVarPublisher = new FmgcSimvarPuplisher(this.bus);
    }

    public initialize(): void {
        this.subscriber = this.bus.getSubscriber<FmgcSimvars>();
        this.publisher = this.bus.getPublisher<FmgcDataBusTypes>();

        this.subscriber.on('msfsPresentPositionLatitude').whenChanged().handle((latitude: number) => {
            this.publisher.pub('presentPositionLatitude', new Arinc429Word(latitude), true, false);
        });
        this.subscriber.on('msfsPresentPositionLongitude').whenChanged().handle((longitude: number) => {
            this.publisher.pub('presentPositionLongitude', new Arinc429Word(longitude), true, false);
        });
        this.subscriber.on('msfsPresentAltitude').whenChanged().handle((altitude: number) => {
            this.publisher.pub('presentAltitude', new Arinc429Word(altitude), true, false);
        });
        this.subscriber.on('msfsPresentHeading').whenChanged().handle((heading: number) => {
            this.publisher.pub('presentHeading', new Arinc429Word(heading), true, false);
        });
        this.subscriber.on('msfsPresentTrack').whenChanged().handle((track: number) => {
            this.publisher.pub('presentTrack', new Arinc429Word(track), true, false);
        });
        this.subscriber.on('msfsComputedAirspeed').whenChanged().handle((cas: number) => {
            this.publisher.pub('computedAirspeed', new Arinc429Word(cas), true, false);
        });
        this.subscriber.on('msfsPresentMach').whenChanged().handle((mach: number) => {
            this.publisher.pub('presentMach', new Arinc429Word(mach), true, false);
        });
        this.subscriber.on('msfsGroundSpeed').whenChanged().handle((groundSpeed: number) => {
            this.publisher.pub('groundSpeed', new Arinc429Word(groundSpeed), true, false);
        });
        this.subscriber.on('msfsVerticalSpeed').whenChanged().handle((verticalSpeed: number) => {
            this.publisher.pub('verticalSpeed', new Arinc429Word(verticalSpeed), true, false);
        });
        this.subscriber.on('msfsAutopilotActive').whenChanged().handle((active: boolean) => {
            this.publisher.pub('autopilotActive', new Arinc429Word(active === true ? 1 : 0), true, false);
        });
        this.subscriber.on('msfsAutothrustMode').whenChanged().handle((mode: number) => {
            this.publisher.pub('autothrustMode', new Arinc429Word(mode), true, false);
        });
        this.subscriber.on('msfsAutothrustSelectedMach').whenChanged().handle((mach: number) => {
            this.publisher.pub('autothrustSelectedMach', new Arinc429Word(mach), true, false);
        });
        this.subscriber.on('msfsAutothrustSelectedKnots').whenChanged().handle((knots: number) => {
            this.publisher.pub('autothrustSelectedKnots', new Arinc429Word(knots), true, false);
        });
        this.subscriber.on('msfsWindDirection').whenChanged().handle((direction: number) => {
            this.publisher.pub('windDirection', new Arinc429Word(direction), true, false);
        });
        this.subscriber.on('msfsWindSpeed').whenChanged().handle((speed: number) => {
            this.publisher.pub('windSpeed', new Arinc429Word(speed), true, false);
        });
        this.subscriber.on('msfsStaticAirTemperature').whenChanged().handle((sat: number) => {
            this.publisher.pub('staticAirTemperature', new Arinc429Word(sat), true, false);
        });
        this.subscriber.on('msfsFlightPhase').whenChanged().handle((phase: number) => {
            this.publisher.pub('flightPhase', new Arinc429Word(phase), true, false);
        });
    }

    public connectedCallback(): void {
        this.simVarPublisher.subscribe('msfsPresentPositionLatitude');
        this.simVarPublisher.subscribe('msfsPresentPositionLongitude');
        this.simVarPublisher.subscribe('msfsPresentAltitude');
        this.simVarPublisher.subscribe('msfsPresentHeading');
        this.simVarPublisher.subscribe('msfsPresentTrack');
        this.simVarPublisher.subscribe('msfsComputedAirspeed');
        this.simVarPublisher.subscribe('msfsPresentMach');
        this.simVarPublisher.subscribe('msfsGroundSpeed');
        this.simVarPublisher.subscribe('msfsVerticalSpeed');
        this.simVarPublisher.subscribe('msfsAutopilotActive');
        this.simVarPublisher.subscribe('msfsAutothrustMode');
        this.simVarPublisher.subscribe('msfsAutothrustSelectedMach');
        this.simVarPublisher.subscribe('msfsAutothrustSelectedKnots');
        this.simVarPublisher.subscribe('msfsWindDirection');
        this.simVarPublisher.subscribe('msfsWindSpeed');
        this.simVarPublisher.subscribe('msfsStaticAirTemperature');
        this.simVarPublisher.subscribe('msfsFlightPhase');
    }

    public startPublish(): void {
        this.simVarPublisher.startPublish();
    }

    public update(): void {
        this.simVarPublisher.onUpdate();
    }
}
