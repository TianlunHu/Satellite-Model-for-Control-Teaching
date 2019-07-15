"use strict";

// import matplotlib.colors as clr
// new_colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
// for i in range(10):
//    print('    C{0}: new BABYLON.Color4({1:.0f}/255, {2:.0f}/255, {3:.0f}/255, 1), // matplotlib C{0}'.format(i, *[255*i for i in clr.colorConverter.to_rgb(new_colors[i])]))
const COLORS = {
    C0: new BABYLON.Color4(31/255, 119/255, 180/255, 1), // matplotlib C0
    C1: new BABYLON.Color4(255/255, 127/255, 14/255, 1), // matplotlib C1 (orange)
    C2: new BABYLON.Color4(44/255, 160/255, 44/255, 1), // matplotlib C2
    C3: new BABYLON.Color4(214/255, 39/255, 40/255, 1), // matplotlib C3
    C4: new BABYLON.Color4(148/255, 103/255, 189/255, 1), // matplotlib C4
    C5: new BABYLON.Color4(140/255, 86/255, 75/255, 1), // matplotlib C5
    C6: new BABYLON.Color4(227/255, 119/255, 194/255, 1), // matplotlib C6
    C7: new BABYLON.Color4(127/255, 127/255, 127/255, 1), // matplotlib C7
    C8: new BABYLON.Color4(188/255, 189/255, 34/255, 1), // matplotlib C8
    C9: new BABYLON.Color4(23/255, 190/255, 207/255, 1), // matplotlib C9
    white: new BABYLON.Color4(1, 1, 1, 1),
    darkgrey: new BABYLON.Color4(46/255, 52/255, 54/255, 1), // oxygen dark grey #2E3436
    grey: new BABYLON.Color4(136/255, 138/255, 133/255, 1), // oxygen grey #888A85
    lightgrey: new BABYLON.Color4(211/255, 215/255, 207/255, 1), // oxygen light grey #D3D7CF
    black: new BABYLON.Color4(0/255, 0/255, 0/255, 1),
    greengrey: new BABYLON.Color4(100/255, 120/255, 100/255, 1),
};
