// Handles received radio messages
radio.onReceivedValue(function (name, virus_strength) {
    let distance = Math.abs(radio.receivedPacket(RadioPacketProperty.SignalStrength) + 42)
    if (name.compare('test') == 0) {
        basic.showArrow(ArrowNames.South)
        basic.pause(200)
        basic.showNumber(Math.abs(radio.receivedPacket(RadioPacketProperty.SignalStrength) + 42))
        basic.pause(1000)
        showState()
    } else if (name.compare('virus') == 0) {
        if (!infected && !begin_gestation && distance < 20) {
            if (health - virus_strength > 0) {
                health = health - virus_strength
            } else {
                begin_gestation = true
                health = 3
            }
            showState()
        }
    }
})

// Sends a radio message with the level of infection/virus strength
function spreadInfection() {
    if (contagiousness == Contagiousness.high) {
        radio.setTransmitPower(5)
        heal_count += 1
    } else if (contagiousness == Contagiousness.medium) {
        radio.setTransmitPower(4)
        heal_count += 2
    } else if (contagiousness == Contagiousness.low) {
        radio.setTransmitPower(3)
        heal_count += 3
    }
    radio.sendValue("virus", contagiousness)
}


// Enters and exists configuration mode
input.onButtonPressed(Button.AB, function () {
    if (ConfigMode == ConfigModes.None) {
        basic.showLeds(`
            # # # # #
            # . # . #
            # # # # #
            # . # . #
            # # # # #
            `)
        ConfigMode = ConfigModes.Select
        basic.pause(10)
        showMenuOption()
    } else {
        ConfigMode = ConfigModes.None
        showState()
    }
})
function showMenuOption() {
    if (config_index == 0) {
        images.arrowImage(ArrowNames.East).showImage(0)
    } else {
        basic.showString("" + ConfigType[config_index])
    }
}
input.onButtonPressed(Button.B, function () {
    if (ConfigMode == ConfigModes.Select) {
        config_index = (config_index + 1) % 4
        showMenuOption();
    } else if (ConfigMode == ConfigModes.Gestation) {
        gestation_period = (gestation_period + 1) % 3 + 1
        showGestationPeriod();
    } else if (ConfigMode == ConfigModes.Contagiousness) {
        contagiousness = (contagiousness + 1) % 3 + 1
        showContagiousness();
    } else if (ConfigMode == ConfigModes.Infection) {
        infected = !infected;
        if (!infected) {
            health = 5
        }
        showInfection();
    }
})
input.onButtonPressed(Button.A, function () {
    if (ConfigMode == ConfigModes.Select) {
        if (ConfigType[config_index] == "G") {
            ConfigMode = ConfigModes.Gestation
            showGestationPeriod()
        } else if (ConfigType[config_index] == "C") {
            ConfigMode = ConfigModes.Contagiousness
            showContagiousness()
        } else if (ConfigType[config_index] == "I") {
            ConfigMode = ConfigModes.Infection
            showInfection()
        }
    } else if (ConfigMode != ConfigModes.None) {
        ConfigMode = ConfigModes.Select
        showMenuOption()
    } else if (ConfigMode == ConfigModes.None) {
        radio.sendValue("test", 0)
        basic.showArrow(ArrowNames.North)
        basic.pause(500)
        showState()
    }
})

function showGestationPeriod() {
    basic.showNumber(gestation_period)
}

function showInfection() {
    if (infected) {
        basic.showNumber(1)
    } else {
        basic.showNumber(0)
    }

}

function showContagiousness() {
    basic.showNumber(contagiousness)
}

function drawHealth() {
    if (health == 5) {
        basic.showLeds(
            `   # # # # #    
            . # . # .
            . . . . .
            # . .  .#
            # # # # #
        `)
    }

    if (health == 4) {
        basic.showLeds(
            `   # # # # .    
            . # . # .
            . . . . .
            # . .  .#
            # # # # #
        `)
    }
    if (health == 3) {
        basic.showLeds(
            `   # # # . .    
            . # . # .
            . . . . .
            # . .  .#
            # # # # #
        `)
    }
    if (health == 2) {
        basic.showLeds(
            `   # # . . .    
            . # . # .
            . . . . .
            # . .  .#
            # # # # #
        `)
    }
    if (health == 1) {
        basic.showLeds(
            `   # . . . .    
            . # . # .
            . . . . .
            # . .  .#
            # # # # #
        `)
    }
    if (health == 0) {
        basic.showLeds(
            `   . . . . .    
            . # . # .
            . . . . .
            # . .  .#
            # # # # #
        `)
    }
}


function showState() {
    if (infected) {
        basic.showIcon(IconNames.Skull)
    } else {
        drawHealth()
    }
}

// Spreads the virus at every SPREAD_FACTOR milliseconds depending on contagiousnes
let SPREAD_FACTOR = 3000
let gestation_period = 2
let begin_gestation = false
let contagiousness = 1
let config_index = 0
let health = 5
let heal_count = 0
let seconds = 0
let infected = false
let ConfigType: string[] = []
led.setBrightness(150)
let ConfigMode = ConfigModes.None
ConfigType = ["", "G", "C", "I"]
ConfigMode = 0
radio.setTransmitPower(3)
showState()
config_index = 0


basic.forever(function () {
    if (ConfigMode == ConfigModes.None) {
        if (infected) {
            spreadInfection()
            basic.pause((3 - contagiousness) * SPREAD_FACTOR)
            if (heal_count >= 15) {
                health = 5
                heal_count = 0
                infected = false
            }
        }
        if (begin_gestation) {
            if (health > 1) {
                health -= 1
            } else {
                begin_gestation = false
                infected = true
                heal_count = 0
            }
            basic.pause(gestation_period * 5000)
        }
        showState()
    }
})
