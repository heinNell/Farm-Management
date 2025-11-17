var _0x27da71 = _0x44ac;
(function(_0x357c1c, _0x1894bc) {
        var _0x289853 = _0x44ac
          , _0xe761bf = _0x357c1c();
        while (!![]) {
                try {
                        var _0xe3e0bf = -parseInt(_0x289853(0xfe)) / 0x1 + -parseInt(_0x289853(0x131)) / 0x2 + parseInt(_0x289853(0x9c)) / 0x3 + parseInt(_0x289853(0xb4)) / 0x4 * (parseInt(_0x289853(0xbc)) / 0x5) + -parseInt(_0x289853(0x160)) / 0x6 + parseInt(_0x289853(0x9d)) / 0x7 + -parseInt(_0x289853(0x19f)) / 0x8 * (-parseInt(_0x289853(0xf4)) / 0x9);
                        if (_0xe3e0bf === _0x1894bc)
                                break;
                        else
                                _0xe761bf['push'](_0xe761bf['shift']());
                } catch (_0x5d3716) {
                        _0xe761bf['push'](_0xe761bf['shift']());
                }
        }
}(_0x33e4, 0x6f4c2));
var HVI_Tank = client[_0x27da71(0x182)](_0x27da71(0x161))
  , fuelbunkerTable = client[_0x27da71(0x182)]('HVI_Tank')
  , fuelbunkerHistoryTable = client[_0x27da71(0x182)](_0x27da71(0x156))
  , HVI_Tank_Adjustment = client['getTable'](_0x27da71(0x118))
  , oTableFuel_Bunker = new sap['m'][(_0x27da71(0x17c))]({
        'noDataText': oBundle[_0x27da71(0x1af)](_0x27da71(0x8a)),
        'growingTriggerText': oBundle['getText'](_0x27da71(0x7d)),
        'sticky': [sap['m']['Sticky'][_0x27da71(0xce)], sap['m'][_0x27da71(0xbe)][_0x27da71(0x1c0)], sap['m'][_0x27da71(0xbe)][_0x27da71(0x19b)]],
        'columns': [new sap['m'][(_0x27da71(0xef))]({
                'width': _0x27da71(0x139),
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x158)),
                        'design': sap['m']['LabelDesign'][_0x27da71(0x195)]
                })
        }), new sap['m'][(_0x27da71(0xef))]({
                'width': _0x27da71(0x139),
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x188)),
                        'design': sap['m']['LabelDesign'][_0x27da71(0x195)]
                })
        }), new sap['m'][(_0x27da71(0xef))]({
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'text': oBundle[_0x27da71(0x1af)]('Location'),
                        'design': sap['m'][_0x27da71(0xc4)]['Bold']
                })
        }), new sap['m']['Column']({
                'header': new sap['m']['Label']({
                        'text': oBundle[_0x27da71(0x1af)]('Description'),
                        'design': sap['m'][_0x27da71(0xc4)][_0x27da71(0x195)]
                }),
                'minScreenWidth': _0x27da71(0x9a),
                'popinDisplay': _0x27da71(0x16f),
                'demandPopin': !![]
        }), new sap['m']['Column']({
                'width': _0x27da71(0x103),
                'header': new sap['m']['Label']({
                        'text': oBundle['getText']('filling_date'),
                        'design': sap['m'][_0x27da71(0xc4)]['Bold']
                }),
                'minScreenWidth': _0x27da71(0x10d),
                'popinDisplay': 'Inline',
                'demandPopin': !![]
        }), new sap['m'][(_0x27da71(0xef))]({
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'text': oBundle[_0x27da71(0x1af)]('Tank_Size'),
                        'design': sap['m'][_0x27da71(0xc4)][_0x27da71(0x195)]
                }),
                'minScreenWidth': _0x27da71(0x9f),
                'popinDisplay': _0x27da71(0x16f),
                'demandPopin': !![],
                'hAlign': 'Center'
        }), new sap['m']['Column']({
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'text': oBundle['getText'](_0x27da71(0xdb)),
                        'design': sap['m'][_0x27da71(0xc4)]['Bold']
                }),
                'minScreenWidth': _0x27da71(0x9f),
                'popinDisplay': _0x27da71(0x16f),
                'demandPopin': !![],
                'hAlign': _0x27da71(0xa4)
        }), new sap['m']['Column']({
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'wrapping': !![],
                        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0xc8)),
                        'design': sap['m'][_0x27da71(0xc4)][_0x27da71(0x195)]
                }),
                'minScreenWidth': 'Desktop',
                'popinDisplay': _0x27da71(0x16f),
                'demandPopin': !![],
                'hAlign': _0x27da71(0xa4)
        }), new sap['m'][(_0x27da71(0xef))]({
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'wrapping': !![],
                        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0xc9)),
                        'design': sap['m'][_0x27da71(0xc4)][_0x27da71(0x195)]
                }),
                'minScreenWidth': _0x27da71(0x9f),
                'popinDisplay': 'Inline',
                'demandPopin': !![],
                'hAlign': _0x27da71(0xa4),
                'width': _0x27da71(0x139)
        }), new sap['m']['Column']({
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'wrapping': !![],
                        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0xbd)),
                        'design': sap['m'][_0x27da71(0xc4)][_0x27da71(0x195)]
                }),
                'minScreenWidth': _0x27da71(0x9f),
                'popinDisplay': _0x27da71(0x16f),
                'demandPopin': !![],
                'hAlign': _0x27da71(0xa4),
                'width': _0x27da71(0x142)
        })],
        'headerToolbar': new sap['m'][(_0x27da71(0x1b8))]({
                'content': [new sap['m'][(_0x27da71(0x171))]({
                        'text': oBundle[_0x27da71(0x1af)]('Add_New_Fuel_Bunker'),
                        'type': _0x27da71(0x199),
                        'icon': 'sap-icon://add',
                        'press': function() {
                                AddEditFuelBunkerDialog(0x1);
                        }
                }), new sap['m'][(_0x27da71(0x122))](), new sap['m'][(_0x27da71(0x136))]({
                        'placeholder': oBundle[_0x27da71(0x1af)]('Search'),
                        'width': _0x27da71(0x18a),
                        'liveChange': function(_0x53203e) {
                                var _0x36735e = _0x27da71
                                  , _0x35cf05 = oTableFuel_Bunker[_0x36735e(0xe5)](_0x36735e(0x13f))
                                  , _0xda29f6 = this[_0x36735e(0x196)]();
                                if (_0x35cf05) {
                                        var _0xe6776 = [new sap['ui'][(_0x36735e(0x14f))][(_0x36735e(0xe8))](_0x36735e(0x130),sap['ui'][_0x36735e(0x14f)][_0x36735e(0x149)][_0x36735e(0x198)],_0xda29f6), new sap['ui'][(_0x36735e(0x14f))][(_0x36735e(0xe8))](_0x36735e(0x188),sap['ui'][_0x36735e(0x14f)][_0x36735e(0x149)][_0x36735e(0x198)],_0xda29f6), new sap['ui'][(_0x36735e(0x14f))][(_0x36735e(0xe8))](_0x36735e(0xb8),sap['ui']['model'][_0x36735e(0x149)][_0x36735e(0x198)],_0xda29f6), new sap['ui'][(_0x36735e(0x14f))]['Filter']('filling_date',sap['ui'][_0x36735e(0x14f)][_0x36735e(0x149)][_0x36735e(0x198)],_0xda29f6), new sap['ui'][(_0x36735e(0x14f))][(_0x36735e(0xe8))](_0x36735e(0x185),sap['ui'][_0x36735e(0x14f)][_0x36735e(0x149)][_0x36735e(0x198)],_0xda29f6), new sap['ui'][(_0x36735e(0x14f))][(_0x36735e(0xe8))](_0x36735e(0x16d),sap['ui'][_0x36735e(0x14f)][_0x36735e(0x149)]['Contains'],_0xda29f6), new sap['ui'][(_0x36735e(0x14f))][(_0x36735e(0xe8))](_0x36735e(0xae),sap['ui'][_0x36735e(0x14f)][_0x36735e(0x149)][_0x36735e(0x198)],_0xda29f6)]
                                          , _0x4fbcc1 = new sap['ui'][(_0x36735e(0x14f))][(_0x36735e(0xe8))](_0xe6776,![]);
                                        _0x35cf05[_0x36735e(0x12e)](_0x4fbcc1);
                                } else
                                        _0x35cf05[_0x36735e(0x12e)]([]);
                        }
                })]
        })
})
  , Fuel_Bunker_Template = new sap['m'][(_0x27da71(0xe2))]({
        'cells': [new sap['m'][(_0x27da71(0x171))]({
                'type': _0x27da71(0x199),
                'icon': _0x27da71(0x123),
                'text': oBundle['getText'](_0x27da71(0x158)),
                'press': function(_0x529575) {
                        var _0x4f2f0e = _0x27da71
                          , _0x363719 = this[_0x4f2f0e(0x1a6)]()
                          , _0x287dc2 = _0x529575['getSource']()[_0x4f2f0e(0xfb)]()[_0x4f2f0e(0xc5)]()
                          , _0x50ef5b = _0x363719[_0x4f2f0e(0x18e)](_0x287dc2);
                        displayMenuFuel_Bunker(_0x529575, _0x50ef5b);
                }
        }), new sap['m'][(_0x27da71(0x101))]({
                'text': '{tank_id}'
        }), new sap['m'][(_0x27da71(0x101))]({
                'wrapping': !![],
                'text': _0x27da71(0x81)
        }), new sap['m'][(_0x27da71(0x101))]({
                'wrapping': !![],
                'text': _0x27da71(0x12b)
        }), new sap['m'][(_0x27da71(0x101))]({
                'wrapping': !![],
                'text': _0x27da71(0x96)
        }), new sap['m'][(_0x27da71(0x101))]({
                'text': {
                        'parts': [{
                                'path': _0x27da71(0x185),
                                'type': new sap['ui']['model'][(_0x27da71(0xf6))][(_0x27da71(0x177))]()
                        }, {
                                'path': 'unit',
                                'type': new sap['ui'][(_0x27da71(0x14f))][(_0x27da71(0xf6))]['String']()
                        }],
                        'formatter': function(_0x50238f, _0xf82b5b) {
                                if (_0x50238f != null)
                                        return _0x50238f + '\x20' + _0xf82b5b;
                        }
                }
        }), new sap['m']['ProgressIndicator']({
                'showValue': !![],
                'state': sap['ui'][_0x27da71(0x1b5)][_0x27da71(0xf0)][_0x27da71(0xaa)],
                'displayValue': {
                        'parts': [{
                                'path': 'capacity',
                                'type': new sap['ui'][(_0x27da71(0x14f))][(_0x27da71(0xf6))][(_0x27da71(0x177))]()
                        }, {
                                'path': 'fuel_level',
                                'type': new sap['ui']['model']['type'][(_0x27da71(0x177))]()
                        }, {
                                'path': _0x27da71(0x8d),
                                'type': new sap['ui'][(_0x27da71(0x14f))][(_0x27da71(0xf6))][(_0x27da71(0x177))]()
                        }],
                        'formatter': function(_0xba1dc3, _0x28b483, _0x2dbd09) {
                                var _0x22ce06 = _0x27da71;
                                if (_0xba1dc3 != null && _0x28b483 != null) {
                                        var _0x4b9648 = _0x28b483 / _0xba1dc3 * 0x64
                                          , _0x3b9283 = Math[_0x22ce06(0x14b)](_0x4b9648 * 0x64) / 0x64;
                                        if (_0x3b9283 <= 0x1e)
                                                this['setState'](sap['ui'][_0x22ce06(0x1b5)]['ValueState'][_0x22ce06(0x100)]);
                                        else
                                                _0x3b9283 > 0x1e && _0x3b9283 < 0x46 ? this[_0x22ce06(0x1bc)](sap['ui'][_0x22ce06(0x1b5)][_0x22ce06(0xf0)][_0x22ce06(0x126)]) : this['setState'](sap['ui'][_0x22ce06(0x1b5)]['ValueState'][_0x22ce06(0xaa)]);
                                        return this[_0x22ce06(0x18f)](_0x3b9283),
                                        _0x3b9283 + '%';
                                }
                        }
                }
        }), new sap['m'][(_0x27da71(0x101))]({
                'text': {
                        'parts': [{
                                'path': 'fuel_level',
                                'type': new sap['ui'][(_0x27da71(0x14f))]['type'][(_0x27da71(0x177))]()
                        }, {
                                'path': _0x27da71(0x8d),
                                'type': new sap['ui'][(_0x27da71(0x14f))][(_0x27da71(0xf6))][(_0x27da71(0x177))]()
                        }],
                        'formatter': function(_0x13665c, _0x48ba03) {
                                if (_0x13665c != null)
                                        return _0x13665c + '\x20' + _0x48ba03;
                        }
                }
        }), new sap['m'][(_0x27da71(0x101))]({
                'text': _0x27da71(0x16a)
        }), new sap['m']['Label']({
                'text': _0x27da71(0xc3)
        })]
});
function _0x44ac(_0x29002a, _0xe0bb28) {
        var _0x33e491 = _0x33e4();
        return _0x44ac = function(_0x44ac84, _0x150318) {
                _0x44ac84 = _0x44ac84 - 0x72;
                var _0x3e0980 = _0x33e491[_0x44ac84];
                return _0x3e0980;
        }
        ,
        _0x44ac(_0x29002a, _0xe0bb28);
}
function displayMenuFuel_Bunker(_0x8819f3, _0x2a42a3) {
        var _0x4ca4f3 = _0x27da71
          , _0x49ba56 = new sap['m']['Menu']({
                'items': [new sap['m'][(_0x4ca4f3(0x114))]({
                        'key': '2',
                        'icon': 'sap-icon://mileage',
                        'text': oBundle[_0x4ca4f3(0x1af)](_0x4ca4f3(0x87))
                }), new sap['m'][(_0x4ca4f3(0x114))]({
                        'key': '1',
                        'icon': _0x4ca4f3(0x99),
                        'text': oBundle[_0x4ca4f3(0x1af)](_0x4ca4f3(0x197))
                }), new sap['m'][(_0x4ca4f3(0x114))]({
                        'key': '3',
                        'icon': _0x4ca4f3(0x162),
                        'text': oBundle['getText']('Edit')
                })],
                'itemSelected': function(_0x5731f1) {
                        var _0x49864e = _0x4ca4f3
                          , _0xfdacbc = _0x5731f1[_0x49864e(0x12d)]('item')[_0x49864e(0x84)]();
                        if (_0xfdacbc == '1')
                                fuelAdjustmentDialog(_0x2a42a3);
                        else {
                                if (_0xfdacbc == '2')
                                        addFuelBunkerQuantityDialog(_0x2a42a3);
                                else {
                                        if (_0xfdacbc == '3')
                                                AddEditFuelBunkerDialog(_0x2a42a3, 0x2);
                                        else
                                                _0xfdacbc == '4' && sap['m'][_0x49864e(0x1ac)][_0x49864e(0x155)](oBundle[_0x49864e(0x1af)]('Do_you_want_to_remove_item'), sap['m'][_0x49864e(0x1ac)][_0x49864e(0x9e)][_0x49864e(0xc6)], oBundle[_0x49864e(0x1af)](_0x49864e(0xd0)), [sap['m']['MessageBox'][_0x49864e(0x158)][_0x49864e(0x192)], sap['m'][_0x49864e(0x1ac)][_0x49864e(0x158)]['NO']], function(_0x206d4e) {
                                                        var _0x289481 = _0x49864e;
                                                        _0x206d4e == 'YES' && (oTableFuel_Bunker[_0x289481(0x111)](!![]),
                                                        fuelbunkerTable['del']({
                                                                'id': _0x2a42a3['id']
                                                        })[_0x289481(0x1c1)](function() {
                                                                funGetFuelbunker();
                                                        }));
                                                });
                                }
                        }
                }
        });
        _0x49ba56['openBy'](_0x8819f3[_0x4ca4f3(0x15b)]());
}
var oTableMobileBunker = oTableFuel_Bunker['clone']();
oTableMobileBunker[_0x27da71(0x1b2)]()[0x1]['setHeader'](TableHeader['clone']()[_0x27da71(0x13b)](oBundle['getText'](_0x27da71(0x181)))),
oTableMobileBunker[_0x27da71(0x1b2)]()[0x7][_0x27da71(0x17e)](TableHeader[_0x27da71(0x120)]()['setText'](oBundle[_0x27da71(0x1af)]('Current_Fuel_Quantity'))),
oTableMobileBunker[_0x27da71(0x104)](new sap['m'][(_0x27da71(0x1b8))]({
        'content': [new sap['m'][(_0x27da71(0x171))]({
                'text': oBundle['getText']('Add_Fuel_Truck'),
                'type': _0x27da71(0x199),
                'icon': 'sap-icon://add',
                'press': function() {
                        AddEditMobileBunkerDialog(0x1);
                }
        }), new sap['m'][(_0x27da71(0x122))](), new sap['m'][(_0x27da71(0x136))]({
                'placeholder': oBundle[_0x27da71(0x1af)]('Search'),
                'width': _0x27da71(0x18a),
                'liveChange': function(_0x37ba5f) {
                        var _0x25ddb7 = _0x27da71
                          , _0x11cc4c = oTableMobileBunker[_0x25ddb7(0xe5)](_0x25ddb7(0x13f))
                          , _0x55dbaa = this[_0x25ddb7(0x196)]();
                        if (_0x11cc4c) {
                                var _0xb1859f = [new sap['ui'][(_0x25ddb7(0x14f))]['Filter'](_0x25ddb7(0x130),sap['ui'][_0x25ddb7(0x14f)][_0x25ddb7(0x149)]['Contains'],_0x55dbaa), new sap['ui'][(_0x25ddb7(0x14f))][(_0x25ddb7(0xe8))]('tank_id',sap['ui'][_0x25ddb7(0x14f)]['FilterOperator'][_0x25ddb7(0x198)],_0x55dbaa), new sap['ui'][(_0x25ddb7(0x14f))][(_0x25ddb7(0xe8))](_0x25ddb7(0xb8),sap['ui'][_0x25ddb7(0x14f)][_0x25ddb7(0x149)][_0x25ddb7(0x198)],_0x55dbaa), new sap['ui'][(_0x25ddb7(0x14f))][(_0x25ddb7(0xe8))](_0x25ddb7(0x1a1),sap['ui'][_0x25ddb7(0x14f)][_0x25ddb7(0x149)]['Contains'],_0x55dbaa), new sap['ui']['model'][(_0x25ddb7(0xe8))](_0x25ddb7(0x185),sap['ui'][_0x25ddb7(0x14f)]['FilterOperator']['Contains'],_0x55dbaa), new sap['ui']['model'][(_0x25ddb7(0xe8))]('fuel_cost',sap['ui'][_0x25ddb7(0x14f)]['FilterOperator'][_0x25ddb7(0x198)],_0x55dbaa), new sap['ui'][(_0x25ddb7(0x14f))]['Filter'](_0x25ddb7(0xae),sap['ui'][_0x25ddb7(0x14f)][_0x25ddb7(0x149)][_0x25ddb7(0x198)],_0x55dbaa)]
                                  , _0x5b354f = new sap['ui'][(_0x25ddb7(0x14f))][(_0x25ddb7(0xe8))](_0xb1859f,![]);
                                _0x11cc4c[_0x25ddb7(0x12e)](_0x5b354f);
                        } else
                                _0x11cc4c['filter']([]);
                }
        })]
}));
var mobileBunkerTemplate = Fuel_Bunker_Template['clone']();
mobileBunkerTemplate[_0x27da71(0xb1)](0x0),
mobileBunkerTemplate['insertCell'](new sap['m'][(_0x27da71(0x171))]({
        'type': _0x27da71(0x199),
        'icon': _0x27da71(0x123),
        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x158)),
        'press': function(_0x44c10d) {
                var _0x542e4e = _0x27da71
                  , _0x1adb12 = this[_0x542e4e(0x1a6)]()
                  , _0x1a3c0e = _0x44c10d[_0x542e4e(0x15b)]()[_0x542e4e(0xfb)]()[_0x542e4e(0xc5)]()
                  , _0x5658ad = _0x1adb12[_0x542e4e(0x18e)](_0x1a3c0e);
                displayMenuMobile_Bunker(_0x44c10d, _0x5658ad);
        }
}), 0x0);
function displayMenuMobile_Bunker(_0x3db523, _0x288af2) {
        var _0x4ff670 = _0x27da71
          , _0x1d5c46 = new sap['m'][(_0x4ff670(0x11c))]({
                'items': [new sap['m']['MenuItem']({
                        'icon': _0x4ff670(0x1c3),
                        'text': oBundle['getText'](_0x4ff670(0xba)),
                        'key': '2'
                }), new sap['m']['MenuItem']({
                        'icon': 'sap-icon://edit',
                        'text': oBundle[_0x4ff670(0x1af)]('Edit'),
                        'key': '3'
                })],
                'itemSelected': function(_0x199ec6) {
                        var _0x2ab340 = _0x4ff670
                          , _0x158ef2 = _0x199ec6['getParameter']('item')[_0x2ab340(0x84)]();
                        if (_0x158ef2 == '2')
                                addMobileBunkerQuantityDialog(_0x288af2);
                        else {
                                if (_0x158ef2 == '3')
                                        AddEditMobileBunkerDialog(_0x288af2, 0x2);
                                else
                                        _0x158ef2 == '4' && sap['m']['MessageBox']['show'](oBundle[_0x2ab340(0x1af)](_0x2ab340(0x1c4)), sap['m']['MessageBox'][_0x2ab340(0x9e)][_0x2ab340(0xc6)], oBundle[_0x2ab340(0x1af)](_0x2ab340(0xd0)), [sap['m'][_0x2ab340(0x1ac)][_0x2ab340(0x158)][_0x2ab340(0x192)], sap['m'][_0x2ab340(0x1ac)]['Action']['NO']], function(_0x57b87b) {
                                                var _0x264fc2 = _0x2ab340;
                                                _0x57b87b == 'YES' && (oTableMobileBunker[_0x264fc2(0x111)](!![]),
                                                fuelbunkerTable[_0x264fc2(0x110)]({
                                                        'id': _0x288af2['id']
                                                })[_0x264fc2(0x1c1)](function() {
                                                        var _0x7e8720 = _0x264fc2;
                                                        funGetFuelbunker(),
                                                        busyDialog[_0x7e8720(0x1ae)]();
                                                }));
                                        });
                        }
                }
        });
        _0x1d5c46[_0x4ff670(0x186)](_0x3db523[_0x4ff670(0x15b)]());
}
var FuelBunkerHistorySearch = new sap['m'][(_0x27da71(0x136))]({
        'placeholder': oBundle[_0x27da71(0x1af)](_0x27da71(0x174)),
        'width': _0x27da71(0x18a),
        'selectOnFocus': ![],
        'layoutData': new sap['ui']['layout'][(_0x27da71(0xb6))]({
                'span': _0x27da71(0xee)
        }),
        'search': function(_0x2cc3f6) {
                var _0x5b5b54 = _0x27da71;
                _0x2cc3f6[_0x5b5b54(0x12d)](_0x5b5b54(0x1b3)) && FuelBunkerHistorySearch[_0x5b5b54(0x173)]('');
        },
        'liveChange': function(_0x2687d9) {
                var _0x39c790 = _0x27da71
                  , _0x129d2e = oTableFuel_Bunker_History['getBinding'](_0x39c790(0x13f))
                  , _0x3a4702 = this[_0x39c790(0x196)]();
                if (_0x129d2e) {
                        var _0x38921d = [new sap['ui'][(_0x39c790(0x14f))][(_0x39c790(0xe8))]('tank_id',sap['ui'][_0x39c790(0x14f)][_0x39c790(0x149)][_0x39c790(0x198)],_0x3a4702), new sap['ui'][(_0x39c790(0x14f))]['Filter'](_0x39c790(0x130),sap['ui'][_0x39c790(0x14f)][_0x39c790(0x149)]['Contains'],_0x3a4702), new sap['ui'][(_0x39c790(0x14f))]['Filter'](_0x39c790(0x1a1),sap['ui']['model']['FilterOperator'][_0x39c790(0x198)],_0x3a4702), new sap['ui']['model'][(_0x39c790(0xe8))]('description',sap['ui'][_0x39c790(0x14f)][_0x39c790(0x149)][_0x39c790(0x198)],_0x3a4702), new sap['ui'][(_0x39c790(0x14f))][(_0x39c790(0xe8))]('quantity',sap['ui'][_0x39c790(0x14f)]['FilterOperator']['Contains'],_0x3a4702)]
                          , _0x1c4fc8 = new sap['ui'][(_0x39c790(0x14f))][(_0x39c790(0xe8))](_0x38921d,![]);
                        _0x129d2e[_0x39c790(0x12e)](_0x1c4fc8);
                } else
                        _0x129d2e[_0x39c790(0x12e)]([]);
        }
})
  , oTableFuel_Bunker_History = new sap['m']['Table']({
        'growing': ![],
        'noDataText': oBundle['getText']('No_Data'),
        'growingTriggerText': oBundle[_0x27da71(0x1af)]('More'),
        'sticky': [sap['m']['Sticky']['ColumnHeaders'], sap['m']['Sticky']['HeaderToolbar'], sap['m']['Sticky'][_0x27da71(0x19b)]],
        'growingThreshold': 0xc,
        'growingScrollToLoad': ![],
        'columns': [new sap['m'][(_0x27da71(0xef))]({
                'width': _0x27da71(0x139),
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'text': oBundle[_0x27da71(0x1af)]('Action'),
                        'design': sap['m'][_0x27da71(0xc4)]['Bold']
                })
        }), new sap['m'][(_0x27da71(0xef))]({
                'header': new sap['m']['Label']({
                        'wrapping': !![],
                        'text': oBundle[_0x27da71(0x1af)]('Tank_Truck_ID'),
                        'design': sap['m']['LabelDesign'][_0x27da71(0x195)]
                })
        }), new sap['m'][(_0x27da71(0xef))]({
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x1c7)),
                        'design': sap['m'][_0x27da71(0xc4)]['Bold']
                })
        }), new sap['m'][(_0x27da71(0xef))]({
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x12f)),
                        'design': sap['m'][_0x27da71(0xc4)]['Bold']
                }),
                'minScreenWidth': 'Desktop',
                'popinDisplay': _0x27da71(0x16f),
                'demandPopin': !![]
        }), new sap['m'][(_0x27da71(0xef))]({
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x1a1)),
                        'design': sap['m'][_0x27da71(0xc4)][_0x27da71(0x195)]
                }),
                'minScreenWidth': 'Tablet',
                'popinDisplay': _0x27da71(0x16f),
                'demandPopin': !![],
                'sortIndicator': 'Descending'
        }), new sap['m'][(_0x27da71(0xef))]({
                'header': new sap['m']['Label']({
                        'text': oBundle[_0x27da71(0x1af)]('Old_Quantity'),
                        'design': sap['m'][_0x27da71(0xc4)][_0x27da71(0x195)]
                }),
                'minScreenWidth': _0x27da71(0x9f),
                'popinDisplay': _0x27da71(0x16f),
                'demandPopin': !![],
                'hAlign': _0x27da71(0xa4)
        }), new sap['m'][(_0x27da71(0xef))]({
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'wrapping': !![],
                        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0xf1)),
                        'design': sap['m']['LabelDesign'][_0x27da71(0x195)]
                }),
                'minScreenWidth': _0x27da71(0x9f),
                'popinDisplay': _0x27da71(0x16f),
                'demandPopin': !![],
                'hAlign': _0x27da71(0xa4)
        }), new sap['m'][(_0x27da71(0xef))]({
                'header': new sap['m']['Label']({
                        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x94)),
                        'design': sap['m'][_0x27da71(0xc4)]['Bold']
                }),
                'minScreenWidth': _0x27da71(0x9f),
                'popinDisplay': 'Inline',
                'demandPopin': !![],
                'hAlign': 'Center'
        }), new sap['m'][(_0x27da71(0xef))]({
                'header': new sap['m'][(_0x27da71(0x101))]({
                        'wrapping': !![],
                        'text': oBundle['getText'](_0x27da71(0xfa)),
                        'design': sap['m'][_0x27da71(0xc4)][_0x27da71(0x195)]
                }),
                'minScreenWidth': _0x27da71(0x9f),
                'popinDisplay': 'Inline',
                'demandPopin': !![],
                'hAlign': _0x27da71(0xa4),
                'width': _0x27da71(0x142)
        }), new sap['m'][(_0x27da71(0xef))]({
                'header': new sap['m']['Label']({
                        'wrapping': !![],
                        'text': oBundle[_0x27da71(0x1af)]('Fuel_Cost'),
                        'design': sap['m']['LabelDesign'][_0x27da71(0x195)]
                }),
                'minScreenWidth': _0x27da71(0x9f),
                'popinDisplay': _0x27da71(0x16f),
                'demandPopin': !![],
                'hAlign': _0x27da71(0xa4),
                'width': _0x27da71(0x142)
        }), new sap['m']['Column']({
                'header': new sap['m']['Label']({
                        'wrapping': !![],
                        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x1b1)),
                        'design': sap['m'][_0x27da71(0xc4)][_0x27da71(0x195)]
                }),
                'minScreenWidth': _0x27da71(0x9f),
                'popinDisplay': _0x27da71(0x16f),
                'demandPopin': !![],
                'hAlign': _0x27da71(0xa4),
                'width': _0x27da71(0x142)
        })],
        'headerToolbar': new sap['m'][(_0x27da71(0x1b8))]({
                'content': [new sap['m']['Title']({
                        'level': _0x27da71(0x1b0),
                        'text': oBundle[_0x27da71(0x1af)]('Fuel_Bunker_History')
                }), new sap['m'][(_0x27da71(0x122))](), FuelBunkerHistorySearch, new sap['m'][(_0x27da71(0x171))]({
                        'icon': 'sap-icon://sort',
                        'press': function() {
                                VSDFuel_Bunker_History['open']();
                        }
                }), new sap['m']['MenuButton']({
                        'icon': _0x27da71(0xd3),
                        'menu': new sap['m'][(_0x27da71(0x11c))]({
                                'itemSelected': function(_0x421c42) {
                                        var _0x5ace9b = _0x27da71
                                          , _0x35414f = _0x421c42[_0x5ace9b(0x12d)](_0x5ace9b(0xd7))[_0x5ace9b(0x84)]();
                                        if (_0x35414f == '1')
                                                fuelBunkerExcelExport();
                                        else
                                                _0x35414f == '2' && fuelBunkerPDFExport();
                                },
                                'items': [new sap['m'][(_0x27da71(0x114))]({
                                        'text': oBundle['getText']('Excel_Export'),
                                        'icon': _0x27da71(0x15e),
                                        'key': '1'
                                })]
                        })
                })]
        })
})
  , Fuel_Bunker_HistoryTemplate = new sap['m'][(_0x27da71(0xe2))]({
        'cells': [new sap['m'][(_0x27da71(0x171))]({
                'type': 'Emphasized',
                'icon': _0x27da71(0x123),
                'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x158)),
                'press': function(_0x3626e6) {
                        var _0x4f1407 = _0x27da71
                          , _0x1dbb99 = this[_0x4f1407(0x1a6)]()
                          , _0x62c92 = _0x3626e6['getSource']()['getBindingContext']()[_0x4f1407(0xc5)]()
                          , _0x2bab1d = _0x1dbb99['getProperty'](_0x62c92)
                          , _0x13a2d8 = new sap['m'][(_0x4f1407(0x11c))]({
                                'title': oBundle[_0x4f1407(0x1af)](_0x4f1407(0xda)),
                                'width': _0x4f1407(0x15a),
                                'items': [],
                                'itemSelected': function(_0x1e7069) {
                                        var _0x12129d = _0x4f1407
                                          , _0x2403fe = _0x1e7069[_0x12129d(0x12d)](_0x12129d(0xd7))[_0x12129d(0x84)]();
                                        if (_0x2403fe == '1')
                                                _0x2bab1d[_0x12129d(0x76)] != null && _0x2bab1d[_0x12129d(0x76)] != '' ? window[_0x12129d(0x157)](_0x2bab1d[_0x12129d(0x76)], '_blank') : sap['m'][_0x12129d(0x1ac)][_0x12129d(0x92)](oBundle[_0x12129d(0x1af)](_0x12129d(0x184)), {
                                                        'title': oBundle[_0x12129d(0x1af)]('Error')
                                                });
                                        else
                                                _0x2403fe == '2' && deleteFuel_Bunker_History(_0x2bab1d);
                                }
                        });
                        _0x2bab1d[_0x4f1407(0x76)] != null && _0x2bab1d[_0x4f1407(0x76)] != '' && _0x13a2d8[_0x4f1407(0x78)](new sap['m'][(_0x4f1407(0x114))]({
                                'icon': _0x4f1407(0x165),
                                'text': oBundle['getText']('Receipt'),
                                'key': '1'
                        })),
                        getDeleteMenu(_0x13a2d8, '2'),
                        _0x13a2d8[_0x4f1407(0x186)](_0x3626e6[_0x4f1407(0x15b)]());
                }
        }), new sap['m'][(_0x27da71(0x89))]({
                'items': [new sap['m'][(_0x27da71(0x101))]({
                        'text': _0x27da71(0x109)
                }), new sap['m'][(_0x27da71(0x1c8))]({
                        'items': [new sap['m']['Label']({
                                'text': _0x27da71(0x121)
                        }), new sap['m'][(_0x27da71(0x101))]({
                                'wrapping': !![],
                                'text': _0x27da71(0x72)
                        })]
                })[_0x27da71(0x17b)](_0x27da71(0xd1))]
        })['addStyleClass'](_0x27da71(0x1a7)), new sap['m'][(_0x27da71(0x101))]({
                'wrapping': !![],
                'text': '{location}'
        }), new sap['m'][(_0x27da71(0x101))]({
                'wrapping': !![],
                'text': _0x27da71(0x12b)
        }), new sap['m'][(_0x27da71(0x101))]({
                'wrapping': !![],
                'text': _0x27da71(0x96)
        }), new sap['m']['Label']({
                'text': _0x27da71(0x12c)
        }), new sap['m'][(_0x27da71(0x101))]({
                'text': {
                        'parts': [{
                                'path': _0x27da71(0xd5),
                                'type': new sap['ui']['model']['type'][(_0x27da71(0x177))]()
                        }, {
                                'path': _0x27da71(0x8d),
                                'type': new sap['ui'][(_0x27da71(0x14f))][(_0x27da71(0xf6))][(_0x27da71(0x177))]()
                        }],
                        'formatter': function(_0x27d195, _0x50e56f) {
                                if (_0x27d195 != null)
                                        return _0x27d195 + '\x20' + _0x50e56f;
                        }
                }
        }), new sap['m']['Label']({
                'text': _0x27da71(0xbf)
        }), new sap['m'][(_0x27da71(0x101))]({
                'text': '{unit_cost}'
        }), new sap['m'][(_0x27da71(0x101))]({
                'text': _0x27da71(0xc3)
        }), new sap['m'][(_0x27da71(0x101))]({
                'text': _0x27da71(0x167)
        })],
        'highlight': {
                'path': _0x27da71(0x1a1),
                'formatter': function(_0x260fa0) {
                        var _0x275387 = _0x27da71;
                        if (_0x260fa0 != null && _0x260fa0 != '') {
                                if (getDate() == _0x260fa0['split']('\x20')[0x0])
                                        return 'Success';
                                return _0x275387(0x1aa);
                        }
                }
        }
})
  , VSDFuel_Bunker_History = new sap['m'][(_0x27da71(0xcd))]({
        'title': oBundle[_0x27da71(0x1af)]('sorting'),
        'sortDescending': !![],
        'confirm': function(_0x423bdc) {
                var _0x13944f = _0x27da71
                  , _0x3276f0 = _0x423bdc['getParameters']()
                  , _0x36ffc2 = null;
                if (_0x3276f0[_0x13944f(0x163)]) {
                        _0x36ffc2 = _0x3276f0[_0x13944f(0x163)][_0x13944f(0xf2)]()[0x0][_0x13944f(0x196)]();
                        var _0x2c6e75 = _0x3276f0[_0x13944f(0x163)]['getCustomData']()[0x0]['getKey']()
                          , _0x833237 = sap['ui'][_0x13944f(0x1b5)]['SortOrder'][_0x13944f(0x85)];
                        this[_0x13944f(0x116)]() ? _0x833237 = sap['ui'][_0x13944f(0x1b5)][_0x13944f(0x18d)][_0x13944f(0x85)] : _0x833237 = sap['ui'][_0x13944f(0x1b5)]['SortOrder'][_0x13944f(0xea)];
                        oTableFuel_Bunker_History[_0x13944f(0x1b2)]()[0x1]['setSortIndicator'](sap['ui'][_0x13944f(0x1b5)][_0x13944f(0x18d)][_0x13944f(0x1aa)]),
                        oTableFuel_Bunker_History[_0x13944f(0x1b2)]()[0x2]['setSortIndicator'](sap['ui'][_0x13944f(0x1b5)][_0x13944f(0x18d)][_0x13944f(0x1aa)]),
                        oTableFuel_Bunker_History[_0x13944f(0x1b2)]()[0x3][_0x13944f(0x83)](sap['ui'][_0x13944f(0x1b5)]['SortOrder'][_0x13944f(0x1aa)]),
                        oTableFuel_Bunker_History[_0x13944f(0x1b2)]()[0x4][_0x13944f(0x83)](sap['ui'][_0x13944f(0x1b5)]['SortOrder'][_0x13944f(0x1aa)]),
                        oTableFuel_Bunker_History[_0x13944f(0x1b2)]()[0x5][_0x13944f(0x83)](sap['ui'][_0x13944f(0x1b5)][_0x13944f(0x18d)][_0x13944f(0x1aa)]);
                        if (_0x2c6e75 == '1')
                                oTableFuel_Bunker_History[_0x13944f(0x1b2)]()[0x1][_0x13944f(0x83)](_0x833237);
                        else {
                                if (_0x2c6e75 == '2')
                                        oTableFuel_Bunker_History[_0x13944f(0x1b2)]()[0x2][_0x13944f(0x83)](_0x833237);
                                else {
                                        if (_0x2c6e75 == '3')
                                                oTableFuel_Bunker_History['getColumns']()[0x3]['setSortIndicator'](_0x833237);
                                        else {
                                                if (_0x2c6e75 == '4')
                                                        oTableFuel_Bunker_History[_0x13944f(0x1b2)]()[0x4][_0x13944f(0x83)](_0x833237);
                                                else
                                                        _0x2c6e75 == '5' && oTableFuel_Bunker_History[_0x13944f(0x1b2)]()[0x5]['setSortIndicator'](_0x833237);
                                        }
                                }
                        }
                        _0x36ffc2 && (_0x36ffc2[_0x13944f(0xec)] = _0x3276f0[_0x13944f(0x140)],
                        _0x2c6e75 === '4' && (_0x36ffc2[_0x13944f(0x1a9)] = function(_0x4cdb5b, _0x4dfc72) {
                                var _0x2bbbf8 = _0x13944f
                                  , _0x28a574 = _0x4cdb5b
                                  , _0x400ff6 = _0x4dfc72;
                                if (_0x28a574['length'] == 0xb)
                                        _0x28a574 = _0x28a574 + '\x2001:00\x20PM';
                                else {
                                        if (_0x28a574[_0x2bbbf8(0x11e)] == 0x11)
                                                _0x28a574 = _0x28a574 + _0x2bbbf8(0x11b);
                                        else
                                                _0x28a574[_0x2bbbf8(0x11e)] == 0xa && (_0x28a574 = '0' + _0x28a574 + _0x2bbbf8(0x10c));
                                }
                                if (_0x400ff6[_0x2bbbf8(0x11e)] == 0xb)
                                        _0x400ff6 = _0x400ff6 + _0x2bbbf8(0x10c);
                                else {
                                        if (_0x400ff6[_0x2bbbf8(0x11e)] == 0x11)
                                                _0x400ff6 = _0x400ff6 + _0x2bbbf8(0x11b);
                                        else
                                                _0x400ff6[_0x2bbbf8(0x11e)] == 0xa && (_0x400ff6 = '0' + _0x400ff6 + '\x2001:00\x20PM');
                                }
                                var _0x48582b = new Date(_0x28a574)
                                  , _0x314d92 = new Date(_0x400ff6);
                                if (_0x314d92 == null)
                                        return -0x1;
                                if (_0x48582b == null)
                                        return 0x1;
                                if (_0x48582b < _0x314d92)
                                        return -0x1;
                                if (_0x48582b > _0x314d92)
                                        return 0x1;
                                return 0x0;
                        }
                        ),
                        _0x2c6e75 === '5' && (_0x36ffc2[_0x13944f(0x1a9)] = function(_0x2a409f, _0x200867) {
                                var _0x2b26ed = 0x0
                                  , _0x3e3415 = 0x0;
                                _0x2a409f == null || _0x2a409f == '' ? _0x2b26ed = 0x0 : _0x2b26ed = parseFloat(_0x2a409f);
                                _0x200867 == null || _0x200867 == '' ? _0x3e3415 = 0x0 : _0x3e3415 = parseFloat(_0x200867);
                                if (_0x2b26ed < _0x3e3415)
                                        return -0x1;
                                if (_0x2b26ed == _0x3e3415)
                                        return 0x0;
                                if (_0x2b26ed > _0x3e3415)
                                        return 0x1;
                                return 0x0;
                        }
                        ),
                        oTableFuel_Bunker_History['getBinding'](_0x13944f(0x13f))[_0x13944f(0x1b9)](_0x36ffc2));
                }
        },
        'sortItems': [new sap['m'][(_0x27da71(0x187))]({
                'text': oBundle['getText'](_0x27da71(0x188)),
                'customData': new sap['ui'][(_0x27da71(0x1b5))][(_0x27da71(0x15c))]({
                        'key': '1',
                        'value': new sap['ui']['model'][(_0x27da71(0x93))](_0x27da71(0x188),![])
                })
        }), new sap['m']['ViewSettingsItem']({
                'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x1c7)),
                'customData': new sap['ui'][(_0x27da71(0x1b5))][(_0x27da71(0x15c))]({
                        'key': '2',
                        'value': new sap['ui'][(_0x27da71(0x14f))]['Sorter'](_0x27da71(0x130),![])
                })
        }), new sap['m'][(_0x27da71(0x187))]({
                'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x12f)),
                'customData': new sap['ui']['core'][(_0x27da71(0x15c))]({
                        'key': '3',
                        'value': new sap['ui'][(_0x27da71(0x14f))][(_0x27da71(0x93))](_0x27da71(0xb8),![])
                })
        }), new sap['m']['ViewSettingsItem']({
                'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x1a1)),
                'selected': !![],
                'customData': new sap['ui']['core']['CustomData']({
                        'key': '4',
                        'value': new sap['ui'][(_0x27da71(0x14f))]['Sorter']('filling_date',![])
                })
        }), new sap['m'][(_0x27da71(0x187))]({
                'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x159)),
                'customData': new sap['ui'][(_0x27da71(0x1b5))][(_0x27da71(0x15c))]({
                        'key': '5',
                        'value': new sap['ui'][(_0x27da71(0x14f))][(_0x27da71(0x93))]('quantity',![])
                })
        })]
})
  , oAppFuelbunker = new sap['m'][(_0x27da71(0x138))]({
        'height': '100%',
        'initialPage': _0x27da71(0x175)
})
  , oAppFuelPageLayout = new sap[(_0x27da71(0xe0))][(_0x27da71(0x105))]({
        'headerContentPinnable': ![],
        'preserveHeaderStateOnScroll': !![],
        'useIconTabBar': !![],
        'toggleHeaderOnTitleClick': !![],
        'headerTitle': new sap[(_0x27da71(0xe0))]['ObjectPageDynamicHeaderTitle']({
                'heading': [new sap['m'][(_0x27da71(0x1ca))]({
                        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0xde)),
                        'level': 'H1',
                        'titleStyle': 'H2'
                })],
                'actions': [new sap['m'][(_0x27da71(0x171))]({
                        'text': oBundle[_0x27da71(0x1af)]('Refill_History'),
                        'icon': _0x27da71(0x190),
                        'press': function() {
                                oAppFuelbunker['to']('bunker_history_page');
                        }
                }), new sap['m'][(_0x27da71(0x171))]({
                        'text': oBundle[_0x27da71(0x1af)](_0x27da71(0x10b)),
                        'icon': _0x27da71(0x190),
                        'press': function() {
                                var _0xd563be = _0x27da71;
                                oAppFuelbunker['to'](_0xd563be(0xc1));
                        }
                })]
        }),
        'sections': [new sap[(_0x27da71(0xe0))][(_0x27da71(0x124))]({
                'id': _0x27da71(0xb5),
                'showTitle': !![],
                'title': oBundle[_0x27da71(0x1af)](_0x27da71(0x10e)),
                'subSections': new sap['uxap'][(_0x27da71(0x193))]({
                        'blocks': [oTableFuel_Bunker]
                })
        }), new sap[(_0x27da71(0xe0))]['ObjectPageSection']({
                'id': _0x27da71(0x90),
                'showTitle': !![],
                'title': oBundle[_0x27da71(0x1af)]('Truck'),
                'subSections': new sap[(_0x27da71(0xe0))]['ObjectPageSubSection']({
                        'blocks': [oTableMobileBunker]
                })
        })],
        'navigate': function(_0x45f96c) {
                var _0x5efd9a = _0x27da71
                  , _0x5e0f18 = _0x45f96c['getParameter'](_0x5efd9a(0x1cc))[_0x5efd9a(0x19a)]();
                if (_0x5e0f18 == _0x5efd9a(0x1a8)) {} else {
                        if (_0x5e0f18 == _0x5efd9a(0xd8)) {}
                }
        }
})
  , fuel_bunkerPage = new sap['m'][(_0x27da71(0x1c9))](_0x27da71(0x175),{
        'showHeader': ![],
        'enableScrolling': !![],
        'content': [oAppFuelPageLayout]
})
  , bunkerHistoryPage = new sap['m'][(_0x27da71(0x1c9))](_0x27da71(0x82),{
        'title': oBundle[_0x27da71(0x1af)](_0x27da71(0x10f)),
        'showHeader': !![],
        'enableScrolling': !![],
        'showNavButton': !![],
        'navButtonPress': function() {
                var _0x56e1a7 = _0x27da71;
                oAppFuelbunker[_0x56e1a7(0x1a5)]();
        },
        'content': [oTableFuel_Bunker_History]
});
oAppFuelbunker[_0x27da71(0x144)](fuel_bunkerPage)[_0x27da71(0x144)](bunkerHistoryPage)['addPage'](bunkerAdjustPage);
function fuelBunkerExcelExport() {
        var _0x19c778 = _0x27da71
          , _0x1b277c = [oBundle['getText'](_0x19c778(0x188)), oBundle[_0x19c778(0x1af)](_0x19c778(0x1c7)), oBundle[_0x19c778(0x1af)]('filling_date'), oBundle[_0x19c778(0x1af)](_0x19c778(0x19c)), oBundle[_0x19c778(0x1af)](_0x19c778(0xf1)), oBundle[_0x19c778(0x1af)](_0x19c778(0x94)), oBundle[_0x19c778(0x1af)](_0x19c778(0x1bb)), oBundle[_0x19c778(0x1af)](_0x19c778(0xfa)), oBundle['getText'](_0x19c778(0x98)), oBundle['getText'](_0x19c778(0x12f))]
          , _0x90e69d = []
          , _0x3e6ccf = oTableFuel_Bunker_History[_0x19c778(0x107)]();
        for (var _0x2d4a21 = 0x0; _0x2d4a21 < _0x3e6ccf[_0x19c778(0x11e)]; _0x2d4a21++) {
                var _0x248f39 = _0x3e6ccf[_0x2d4a21][_0x19c778(0xfb)]()[_0x19c778(0x91)]();
                _0x90e69d[_0x19c778(0x8c)]({
                        '1': _0x248f39[_0x19c778(0x188)],
                        '2': _0x248f39['location'],
                        '3': _0x248f39['filling_date'],
                        '4': _0x248f39[_0x19c778(0x1ad)],
                        '5': _0x248f39['quantity'],
                        '6': _0x248f39['new_quantity'],
                        '7': _0x248f39['unit'],
                        '8': _0x248f39[_0x19c778(0x95)],
                        '9': _0x248f39[_0x19c778(0x16d)],
                        '10': _0x248f39['description']
                });
        }
        var _0x1b1752 = [];
        _0x1b1752['push'](_0x1b277c),
        $[_0x19c778(0x151)](_0x90e69d, function(_0x54915d, _0x4c2d49) {
                var _0x4767c6 = [];
                $['each'](_0x4c2d49, function(_0x446629, _0x1d7634) {
                        var _0x5bd79d = _0x44ac;
                        _0x4767c6[_0x5bd79d(0x8c)](_0x1d7634);
                }),
                _0x1b1752['push'](_0x4767c6);
        });
        var _0x5b0636 = _0x19c778(0x152)
          , _0x2affaf = _0x19c778(0x11f)
          , _0x5cc490 = XLSX[_0x19c778(0x75)][_0x19c778(0xf3)]()
          , _0x286f5b = XLSX[_0x19c778(0x75)]['aoa_to_sheet'](_0x1b1752);
        XLSX[_0x19c778(0x75)][_0x19c778(0xf9)](_0x5cc490, _0x286f5b, _0x2affaf),
        XLSX['writeFile'](_0x5cc490, _0x5b0636);
}
function fuelBunkerPDFExport() {
        var _0x4cdb9a = _0x27da71
          , _0x3ebe3d = [{
                'title': oBundle['getText'](_0x4cdb9a(0x188)),
                'key': _0x4cdb9a(0x188)
        }, {
                'title': oBundle[_0x4cdb9a(0x1af)](_0x4cdb9a(0x1c7)),
                'key': _0x4cdb9a(0x130)
        }, {
                'title': oBundle[_0x4cdb9a(0x1af)](_0x4cdb9a(0x1a1)),
                'key': _0x4cdb9a(0x1a1)
        }, {
                'title': oBundle[_0x4cdb9a(0x1af)](_0x4cdb9a(0x159)),
                'key': _0x4cdb9a(0xd5)
        }, {
                'title': oBundle[_0x4cdb9a(0x1af)](_0x4cdb9a(0x1bb)),
                'key': _0x4cdb9a(0x8d)
        }, {
                'title': oBundle[_0x4cdb9a(0x1af)](_0x4cdb9a(0xfa)),
                'key': _0x4cdb9a(0x95)
        }, {
                'title': oBundle['getText'](_0x4cdb9a(0x98)),
                'key': 'fuel_cost'
        }, {
                'title': oBundle[_0x4cdb9a(0x1af)]('Note'),
                'key': 'description'
        }]
          , _0x45a6ee = (oTableFuel_Bunker_History[_0x4cdb9a(0x107)]() || [])['map'](function(_0x13ff85) {
                var _0xa31cee = _0x4cdb9a;
                return _0x13ff85[_0xa31cee(0xfb)]()['getObject']();
        })
          , _0x4f70c8 = new jsPDF('l','pt');
        _0x4f70c8[_0x4cdb9a(0xd4)](0xc),
        _0x4f70c8['autoTable'](_0x3ebe3d, _0x45a6ee, {
                'columnStyles': {
                        0x2: {
                                'columnWidth': 'auto'
                        }
                }
        }),
        _0x4f70c8[_0x4cdb9a(0x13a)](_0x4cdb9a(0xa5));
}
function deleteFuel_Bunker_History(_0x306bcc) {
        var _0x1becda = _0x27da71
          , _0x3cbb66 = new sap['m'][(_0x1becda(0x1cb))]({
                'title': oBundle[_0x1becda(0x1af)]('Alert'),
                'initialFocus': null,
                'state': sap['ui'][_0x1becda(0x1b5)][_0x1becda(0xf0)]['Error'],
                'content': [new sap['m'][(_0x1becda(0x101))]({
                        'text': oBundle[_0x1becda(0x1af)](_0x1becda(0x19d))
                })],
                'buttons': [new sap['m'][(_0x1becda(0x171))]({
                        'type': sap['m'][_0x1becda(0xa1)][_0x1becda(0x189)],
                        'text': oBundle[_0x1becda(0x1af)]('Delete'),
                        'icon': _0x1becda(0xdd),
                        'press': function() {
                                var _0x5f5488 = _0x1becda;
                                busyDialog['open'](),
                                fuelbunkerHistoryTable[_0x5f5488(0x110)]({
                                        'id': _0x306bcc['id']
                                })[_0x5f5488(0x1c1)](function() {
                                        var _0x5358df = _0x5f5488;
                                        funGetFuelbunker(),
                                        busyDialog['close'](),
                                        _0x3cbb66[_0x5358df(0x1ae)]();
                                }, failure);
                                var _0x317350 = emailJSONFuelbunker['filter'](function(_0x2f7c44, _0x3d07f9) {
                                        var _0x21c22c = _0x5f5488;
                                        return _0x2f7c44['tank_id'] == _0x306bcc[_0x21c22c(0x188)];
                                });
                                _0x317350[_0x5f5488(0x11e)] > 0x0 && fuelbunkerTable[_0x5f5488(0x17a)]({
                                        'master_email': emailUser,
                                        'id': _0x317350[0x0]['id']
                                })[_0x5f5488(0xe1)]()[_0x5f5488(0x1c1)](function(_0x1ec081) {
                                        var _0x5d43b9 = _0x5f5488;
                                        if (_0x1ec081['length'] > 0x0) {
                                                if (nullCheck(_0x1ec081[0x0][_0x5d43b9(0xae)]) && _0x306bcc['fuel_level']) {
                                                        var _0x10f1e2 = parseFloat(_0x1ec081[0x0][_0x5d43b9(0xae)]) + parseFloat(_0x306bcc[_0x5d43b9(0xd5)]);
                                                        fuelbunkerTable[_0x5d43b9(0x119)]({
                                                                'id': _0x1ec081[0x0]['id'],
                                                                'fuel_level': _0x10f1e2
                                                        })[_0x5d43b9(0x1c1)](function() {
                                                                funGetFuelbunker();
                                                        });
                                                }
                                        }
                                });
                        }
                }), new sap['m'][(_0x1becda(0x171))]({
                        'text': oBundle[_0x1becda(0x1af)]('Cancel'),
                        'icon': _0x1becda(0xca),
                        'press': function() {
                                var _0x15cf75 = _0x1becda;
                                _0x3cbb66[_0x15cf75(0x1ae)]();
                        }
                })]
        })[_0x1becda(0x157)]();
}
function _0x33e4() {
        var _0x51bf00 = ['email', 'Add_Fuel', 'model', '\x20-\x20', 'each', 'FuelBunkerHistoryExport.xlsx', 'xls', 'PNG', 'show', 'HVI_Tank_History', 'open', 'Action', 'Quantity', '200px', 'getSource', 'CustomData', 'Select_Source_Tank', 'sap-icon://excel-attachment', '__createdAt', '443652Husamu', 'HVI_Tank', 'sap-icon://edit', 'sortItem', 'location_id', 'sap-icon://receipt', 'Add', '{refill_by}', 'Text', 'Fuel_Refilling', '{unit_cost}', 'Tank00', 'Number', 'fuel_cost', 'Select', 'Inline', 'IconPool', 'Button', 'Minus_will_reduce_the_value', 'setValue', 'Search', 'fuel_bunker', 'Fuel_Adjustment', 'String', 'statusindicator', '#ED4A7B', 'where', 'addStyleClass', 'Table', 'getItem', 'setHeader', 'FileUploader', 'notification_email', 'Truck_ID', 'getTable', 'Adjust_Value', 'Receipt_not_available', 'capacity', 'openBy', 'ViewSettingsItem', 'tank_id', 'Reject', '300px', 'bindItems', 'fuel_email', 'SortOrder', 'getProperty', 'setPercentValue', 'sap-icon://history', '{location_id}', 'YES', 'ObjectPageSubSection', '100px', 'Bold', 'getValue', 'Adjustment', 'Contains', 'Emphasized', 'getId', 'InfoToolbar', 'Old_Quantity', 'Sure_You_want_to_delete', 'createdAt', '112696kFpjqO', 'ajax', 'filling_date', 'ResponsiveGridLayout', 'getSelectedItem', 'getSelectedKey', 'backToTop', 'getModel', 'sapUiTinyMargin', 'wo2', 'fnCompare', 'None', 'attr', 'MessageBox', 'old_quantity', 'close', 'getText', 'Auto', 'Refill_by', 'getColumns', 'clearButtonPressed', 'PropertyThreshold', 'core', 'pdf', 'responseRaw', 'Toolbar', 'sort', 'additionalText', 'Unit', 'setState', 'FileUploaderParameter', 'Fuel_Quantity', 'Wrapping', 'HeaderToolbar', 'done', 'jpg', 'sap-icon://mileage', 'Do_you_want_to_remove_item', 'orderByDescending', 'setLabel', 'Location', 'HBox', 'Page', 'Title', 'Dialog', 'section', '{source_tank_id}', '<hr/>', 'unified', 'utils', 'receipt', 'Tank_ID', 'addItem', 'Edit_Fuel_Bunker', 'add', 'hvi_fuel_alert_flag', 'replace', 'More', 'New_Value', 'HorizontalLayout', 'name', '{location}', 'bunker_history_page', 'setSortIndicator', 'getKey', 'Descending', 'getIconURI', 'Tank_Refill', 'insert', 'VBox', 'No_Data', 'form', 'push', 'unit', 'Upload', 'Liter', 'fuel2', 'getObject', 'error', 'Sorter', 'New_Quantity', 'unit_cost', '{filling_date}', 'VerticalLayout', 'Total_Cost', 'sap-icon://unwired', '1500px', 'tank_capacity', '403362wdZnbL', '3693109BfuwUh', 'Icon', 'Desktop', 'Attachment_Uploading', 'ButtonType', 'upload', 'Add_Fuel_Bunker', 'Center', 'FuelBunkerHistoryExport.pdf', 'take', 'setSelectedKey', 'Fuel_Consumption', 'Add_Fuel_Truck', 'Success', 'floor', '60%', 'sap-icon://browse-folder', 'fuel_level', 'text', 'Refilling_is_not_allowed_in_same_truck', 'removeCell', 'total', 'This_is_not_valid_file_type', '1316ohZbbw', 'fuel1', 'GridData', 'Save', 'description', 'ListItem', 'Truck_Refill', 'ComboBox', '2810oSDPLB', 'Fuel_Cost', 'Sticky', '{new_quantity}', 'suite', 'bunker_adjust_page', 'commons', '{fuel_cost}', 'LabelDesign', 'getPath', 'ERROR', 'Current_Value', 'current_fuel_level', 'Avg_Unit_Cost', 'sap-icon://decline', 'Update', '100%', 'ViewSettingsDialog', 'ColumnHeaders', 'Form', 'Alert', 'sapUiTinyMarginTop', 'Not_enough_fuel_available_in_selected_tank', 'sap-icon://menu', 'setFontSize', 'quantity', 'Input', 'item', 'wo3', 'Upload_file_first', 'Option', 'Fuel_Level', 'layout', 'sap-icon://delete', 'Fuel_Bunker', 'Site', 'uxap', 'read', 'ColumnListItem', '/modelData', 'sap-icon://add', 'getBinding', 'Fuel_level_can_not_more_than_capacity', 'https://heavyvehicleinspection.com/upload/bunker_receipt/', 'Filter', 'File\x20size\x20more\x20than\x201\x20MB\x20not\x20allowed', 'Ascending', 'FormContainer', 'bDescending', 'setVisible', 'L4\x20M6\x20S12', 'Column', 'ValueState', 'Refill_Quantity', 'getCustomData', 'book_new', '639sRohJA', 'Select_Tank_ID', 'type', 'Truck00', 'png', 'book_append_sheet', 'Unit_Cost', 'getBindingContext', 'Mobile_Tank_Size', 'ObjectStatus', '689517oURxPu', 'https://heavyvehicleinspection.com/notification/send_alert_fuel_bunker.php', 'Error', 'Label', 'Gallon', '150px', 'setHeaderToolbar', 'ObjectPageLayout', 'find', 'getItems', 'addPropertyThreshold', '{tank_id}', '70px', 'Adjustment_History', '\x2001:00\x20PM', 'Tablet', 'Tank', 'Bunker_History', 'del', 'setBusy', 'Description', 'FormElement', 'MenuItem', 'HTML', 'getSortDescending', 'setModel', 'HVI_Tank_Adjustment', 'update', 'addEventDelegate', '\x20PM', 'Menu', 'BusyDialog', 'length', 'Data', 'clone', 'Src-', 'ToolbarSpacer', 'sap-icon://action', 'ObjectPageSection', '50%', 'Warning', 'input', 'bindProperty', 'JSONModel', 'includeTotalCount', '{description}', '{old_quantity}', 'getParameter', 'filter', 'Note', 'location', '1255566bRcFYK', 'Truck_Size', 'lengthComputable', 'setData', '{location_name}', 'SearchField', 'POST', 'App', '120px', 'save', 'setText', 'source', 'Invalid', 'setTitle', 'items', 'sortDescending', 'doc', '80px', 'TextArea', 'addPage', 'json', 'setEnabled', 'readonly', 'Tank_Refilling', 'FilterOperator', 'JPEG', 'round', 'Cancel'];
        _0x33e4 = function() {
                return _0x51bf00;
        }
        ;
        return _0x33e4();
}
function fuelAdjustmentDialog(_0x185666) {
        var _0x5ea213 = _0x27da71
          , _0x1e6833 = new sap['m'][(_0x5ea213(0xd6))]({
                'editable': ![],
                'type': _0x5ea213(0x16c),
                'value': _0x185666[_0x5ea213(0xae)],
                'width': _0x5ea213(0xcc)
        })
          , _0x47a216 = new sap['m']['Input']({
                'type': _0x5ea213(0x16c),
                'width': _0x5ea213(0xcc),
                'liveChange': function(_0x2aa40c) {
                        var _0x57a517 = _0x5ea213
                          , _0x5cfba9 = _0x1e6833[_0x57a517(0x196)]()
                          , _0xebe5a1 = _0x47a216[_0x57a517(0x196)]();
                        if (_0xebe5a1 != '') {
                                var _0x3cfbdf = parseFloat(_0x5cfba9) + parseFloat(_0xebe5a1);
                                if (_0x3cfbdf >= 0x0) {
                                        _0x266b54[_0x57a517(0x173)](_0x3cfbdf);
                                        var _0x32e544 = parseFloat(_0x185666[_0x57a517(0x95)]) * parseFloat(_0x3cfbdf);
                                        _0x2ec6a0[_0x57a517(0x173)](_0x32e544);
                                } else
                                        _0x266b54[_0x57a517(0x173)](''),
                                        _0x2ec6a0[_0x57a517(0x173)](_0x185666[_0x57a517(0x16d)]);
                        } else
                                _0x266b54[_0x57a517(0x173)](''),
                                _0x2ec6a0[_0x57a517(0x173)](_0x185666[_0x57a517(0x16d)]);
                }
        })
          , _0x266b54 = new sap['m'][(_0x5ea213(0xd6))]({
                'editable': ![],
                'type': _0x5ea213(0x16c),
                'width': _0x5ea213(0xcc)
        })
          , _0xaa6a79 = new sap['m']['Input']({
                'editable': ![],
                'type': _0x5ea213(0x16c),
                'value': _0x185666[_0x5ea213(0x95)],
                'width': _0x5ea213(0xcc)
        })
          , _0x2ec6a0 = new sap['m'][(_0x5ea213(0xd6))]({
                'editable': ![],
                'type': _0x5ea213(0x16c),
                'value': _0x185666[_0x5ea213(0x16d)],
                'width': _0x5ea213(0xcc)
        })
          , _0x1132f4 = new sap['m'][(_0x5ea213(0x143))]({
                'width': _0x5ea213(0xcc),
                'height': _0x5ea213(0x10a),
                'rows': 0x2,
                'wrapping': sap['ui']['core'][_0x5ea213(0x1bf)]['on']
        })
          , _0x2a7568 = new sap[(_0x5ea213(0xe0))][(_0x5ea213(0x105))]({
                'headerContentPinnable': !![],
                'preserveHeaderStateOnScroll': !![],
                'useIconTabBar': !![],
                'headerContent': [new sap['ui'][(_0x5ea213(0xdc))]['VerticalLayout']({
                        'content': [new sap['m'][(_0x5ea213(0x1ca))]({
                                'text': oBundle['getText'](_0x5ea213(0xc7))
                        }), new sap['ui'][(_0x5ea213(0x1b5))]['HTML']({
                                'content': _0x5ea213(0x73)
                        }), new sap['m'][(_0x5ea213(0xfd))]({
                                'title': oBundle['getText'](_0x5ea213(0x1be))
                        }), _0x1e6833, new sap['m'][(_0x5ea213(0xfd))]({
                                'title': oBundle[_0x5ea213(0x1af)]('Avg_Unit_Cost')
                        }), _0xaa6a79, new sap['m'][(_0x5ea213(0xfd))]({
                                'title': oBundle['getText'](_0x5ea213(0xbd))
                        }), _0x2ec6a0]
                }), new sap['ui'][(_0x5ea213(0xdc))][(_0x5ea213(0x97))]({
                        'content': [new sap['m'][(_0x5ea213(0x1ca))]({
                                'text': oBundle[_0x5ea213(0x1af)](_0x5ea213(0x183))
                        }), new sap['ui'][(_0x5ea213(0x1b5))][(_0x5ea213(0x115))]({
                                'content': '<hr/>'
                        }), new sap['m']['ObjectStatus']({
                                'title': oBundle[_0x5ea213(0x1af)](_0x5ea213(0x1be))
                        }), _0x47a216, new sap['m'][(_0x5ea213(0x168))]({
                                'text': oBundle[_0x5ea213(0x1af)](_0x5ea213(0x172))
                        })]
                }), new sap['ui']['layout'][(_0x5ea213(0x97))]({
                        'content': [new sap['m'][(_0x5ea213(0x1ca))]({
                                'text': oBundle[_0x5ea213(0x1af)](_0x5ea213(0x7e))
                        }), new sap['ui'][(_0x5ea213(0x1b5))]['HTML']({
                                'content': _0x5ea213(0x73)
                        }), new sap['m'][(_0x5ea213(0xfd))]({
                                'title': oBundle[_0x5ea213(0x1af)]('Fuel_Quantity')
                        }), _0x266b54]
                }), new sap['ui'][(_0x5ea213(0xdc))][(_0x5ea213(0x97))]({
                        'width': _0x5ea213(0xcc),
                        'content': [new sap['m']['ObjectStatus']({
                                'title': oBundle[_0x5ea213(0x1af)](_0x5ea213(0x12f))
                        }), _0x1132f4]
                })]
        })
          , _0x3fe3db = new sap['m'][(_0x5ea213(0x171))]({
                'text': oBundle[_0x5ea213(0x1af)](_0x5ea213(0xb7)),
                'icon': sap['ui'][_0x5ea213(0x1b5)][_0x5ea213(0x170)][_0x5ea213(0x86)](_0x5ea213(0x13a)),
                'press': function() {
                        var _0x1a2cca = _0x5ea213
                          , _0x21bccc = _0x1e6833[_0x1a2cca(0x196)]()
                          , _0x5f3307 = _0x47a216['getValue']()
                          , _0x51bf5a = _0x266b54['getValue']()
                          , _0x548c5a = _0xaa6a79[_0x1a2cca(0x196)]()
                          , _0x35b098 = _0x2ec6a0[_0x1a2cca(0x196)]()
                          , _0x564353 = _0x1132f4['getValue']();
                        if (validation(_0x51bf5a, oBundle['getText'](_0x1a2cca(0x1be))))
                                return;
                        if (!nullCheck(_0x51bf5a) || minusCheck(_0x51bf5a)) {
                                sap['m'][_0x1a2cca(0x1ac)][_0x1a2cca(0x92)](oBundle[_0x1a2cca(0x1af)](_0x1a2cca(0x13d)) + '\x20' + oBundle['getText'](_0x1a2cca(0x1be)), {
                                        'title': oBundle[_0x1a2cca(0x1af)](_0x1a2cca(0x100))
                                });
                                return;
                        }
                        busyDialog[_0x1a2cca(0x157)](),
                        fuelbunkerTable[_0x1a2cca(0x119)]({
                                'id': _0x185666['id'],
                                'fuel_level': _0x51bf5a,
                                'unit_cost': _0x548c5a,
                                'fuel_cost': _0x35b098
                        })[_0x1a2cca(0x1c1)](function() {
                                var _0x5cef14 = _0x1a2cca;
                                funGetFuelbunker(),
                                _0x37fc24[_0x5cef14(0x1ae)](),
                                busyDialog[_0x5cef14(0x1ae)]();
                        });
                        var _0x1ce473 = getDate() + '\x20' + getTime()
                          , _0x47349c = operatedBy;
                        HVI_Tank_Adjustment['insert']({
                                'master_email': emailUser,
                                'tank_id': _0x185666[_0x1a2cca(0x188)],
                                'location': _0x185666[_0x1a2cca(0x130)],
                                'unit': _0x185666[_0x1a2cca(0x8d)],
                                'old_quantity': _0x21bccc,
                                'adjust_quantity': _0x5f3307,
                                'new_quantity': _0x51bf5a,
                                'old_avg_cost': _0x548c5a,
                                'adjust_avg_cost': _0x548c5a,
                                'new_avg_cost': _0x548c5a,
                                'old_total_cost': _0x35b098,
                                'adjust_total_cost': '0',
                                'new_total_cost': _0x35b098,
                                'description': _0x564353,
                                'adjustment_date': _0x1ce473,
                                'adjust_by': _0x47349c,
                                'location_id': hvi_location_id
                        })[_0x1a2cca(0x1c1)](function() {
                                funGetAdjustHistory();
                        });
                }
        })
          , _0x37fc24 = new sap['m'][(_0x5ea213(0x1cb))]({
                'draggable': !![],
                'resizable': !![],
                'contentWidth': _0x5ea213(0xac),
                'title': oBundle[_0x5ea213(0x1af)](_0x5ea213(0x176)) + _0x5ea213(0x150) + _0x185666[_0x5ea213(0x188)],
                'content': [_0x2a7568],
                'buttons': [_0x3fe3db, new sap['m']['Button']({
                        'text': oBundle[_0x5ea213(0x1af)](_0x5ea213(0x14c)),
                        'icon': 'sap-icon://decline',
                        'press': function() {
                                var _0x51644c = _0x5ea213;
                                _0x37fc24[_0x51644c(0x1ae)]();
                        }
                })]
        })[_0x5ea213(0x157)]();
        _0x37fc24[_0x5ea213(0x111)](!![]),
        fuelbunkerTable[_0x5ea213(0x17a)]({
                'master_email': emailUser,
                'id': _0x185666['id']
        })['read']()[_0x5ea213(0x1c1)](function(_0x450243) {
                var _0x166184 = _0x5ea213;
                _0x450243[_0x166184(0x11e)] > 0x0 && (_0x1e6833['setValue'](_0x450243[0x0][_0x166184(0xae)]),
                _0xaa6a79[_0x166184(0x173)](_0x450243[0x0][_0x166184(0x95)]),
                _0x2ec6a0['setValue'](_0x450243[0x0][_0x166184(0x16d)]),
                _0x37fc24[_0x166184(0x111)](![]));
        });
}
function AddEditFuelBunkerDialog(_0x3a8fcd, _0x303f43) {
        var _0x37213f = _0x27da71
          , _0x9ee937 = new sap['m']['Input']({
                'editable': ![],
                'value': '',
                'width': _0x37213f(0xcc)
        })
          , _0x578bea = new sap['m']['Input']({
                'value': '',
                'width': _0x37213f(0xcc)
        })
          , _0x4f0b70 = new sap['m']['Input']({
                'value': '',
                'width': _0x37213f(0xcc)
        })
          , _0x118c1d = new sap['m'][(_0x37213f(0xd6))]({
                'type': _0x37213f(0x16c),
                'value': '',
                'width': _0x37213f(0xcc)
        })
          , _0x5e1501 = new sap['m'][(_0x37213f(0xbb))]();
        _0x5e1501[_0x37213f(0x78)](new sap['ui'][(_0x37213f(0x1b5))][(_0x37213f(0xb9))]({
                'key': '1',
                'text': oBundle[_0x37213f(0x1af)](_0x37213f(0x102))
        })),
        _0x5e1501['addItem'](new sap['ui'][(_0x37213f(0x1b5))]['ListItem']({
                'key': '2',
                'text': oBundle[_0x37213f(0x1af)]('Liter')
        })),
        _0x5e1501[_0x37213f(0xa7)]('1'),
        _0x5e1501['addEventDelegate']({
                'onAfterRendering': function(_0x47eb6d) {
                        var _0x3b4bde = _0x37213f;
                        _0x5e1501['$']()[_0x3b4bde(0x106)]('input')[_0x3b4bde(0x1ab)](_0x3b4bde(0x147), !![]);
                }
        });
        var _0x49b968 = new sap['m'][(_0x37213f(0xbb))]({
                'width': '100%',
                'items': {
                        'path': _0x37213f(0xe3),
                        'template': new sap['ui']['core'][(_0x37213f(0xb9))]({
                                'key': _0x37213f(0x191),
                                'text': _0x37213f(0x135)
                        })
                }
        });
        _0x49b968[_0x37213f(0x11a)]({
                'onAfterRendering': function(_0x44786b) {
                        var _0x2a7329 = _0x37213f;
                        _0x49b968['$']()[_0x2a7329(0x106)](_0x2a7329(0x127))['attr'](_0x2a7329(0x147), !![]);
                }
        });
        var _0x25a1bf = new sap['ui'][(_0x37213f(0x14f))][(_0x37213f(0x145))][(_0x37213f(0x129))]();
        _0x25a1bf[_0x37213f(0x134)]({
                'modelData': emailJSONLocation
        }),
        _0x49b968['setModel'](_0x25a1bf);
        if (_0x303f43 == 0x2)
                _0x9ee937[_0x37213f(0x173)](_0x3a8fcd['tank_id']),
                _0x578bea[_0x37213f(0x173)](_0x3a8fcd[_0x37213f(0x130)]),
                _0x4f0b70[_0x37213f(0x173)](_0x3a8fcd[_0x37213f(0xb8)]),
                _0x118c1d[_0x37213f(0x173)](_0x3a8fcd[_0x37213f(0x185)]),
                _0x5e1501['setValue'](_0x3a8fcd['unit']),
                _0x49b968[_0x37213f(0xa7)](_0x3a8fcd[_0x37213f(0x164)]);
        else {
                var _0x235dcb = emailJSONFuelbunker[_0x37213f(0x12e)](function(_0x1b6fad, _0x3728c1) {
                        return _0x1b6fad['source'] == '1';
                });
                _0x9ee937[_0x37213f(0x173)](_0x37213f(0x16b) + (_0x235dcb[_0x37213f(0x11e)] + 0x1));
        }
        var _0x510f59 = new sap['ui'][(_0x37213f(0xdc))]['form']['Form']({
                'editable': !![],
                'layout': new sap['ui'][(_0x37213f(0xdc))]['form'][(_0x37213f(0x1a2))](),
                'formContainers': [new sap['ui'][(_0x37213f(0xdc))]['form'][(_0x37213f(0xeb))]({
                        'formElements': [new sap['ui']['layout'][(_0x37213f(0x8b))][(_0x37213f(0x113))]({
                                'label': new sap['m'][(_0x37213f(0x101))]({
                                        'required': !![],
                                        'text': oBundle[_0x37213f(0x1af)](_0x37213f(0x188))
                                }),
                                'fields': [_0x9ee937]
                        }), new sap['ui'][(_0x37213f(0xdc))][(_0x37213f(0x8b))][(_0x37213f(0x113))]({
                                'label': new sap['m'][(_0x37213f(0x101))]({
                                        'required': !![],
                                        'text': oBundle[_0x37213f(0x1af)](_0x37213f(0x9b))
                                }),
                                'fields': [new sap['ui'][(_0x37213f(0xdc))][(_0x37213f(0x7f))]({
                                        'content': [_0x118c1d, _0x5e1501]
                                })]
                        }), new sap['ui'][(_0x37213f(0xdc))][(_0x37213f(0x8b))][(_0x37213f(0x113))]({
                                'label': new sap['m'][(_0x37213f(0x101))]({
                                        'required': !![],
                                        'text': oBundle[_0x37213f(0x1af)](_0x37213f(0x1c7))
                                }),
                                'fields': [_0x578bea]
                        }), new sap['ui'][(_0x37213f(0xdc))][(_0x37213f(0x8b))][(_0x37213f(0x113))]({
                                'label': new sap['m'][(_0x37213f(0x101))]({
                                        'required': !![],
                                        'text': oBundle[_0x37213f(0x1af)](_0x37213f(0xdf))
                                }),
                                'fields': [_0x49b968]
                        }), new sap['ui'][(_0x37213f(0xdc))][(_0x37213f(0x8b))][(_0x37213f(0x113))]({
                                'label': new sap['m']['Label']({
                                        'text': oBundle['getText'](_0x37213f(0x112))
                                }),
                                'fields': [_0x4f0b70]
                        })]
                })]
        })
          , _0x3275e2 = new sap['m'][(_0x37213f(0x171))]({
                'text': oBundle['getText'](_0x37213f(0xa3)),
                'icon': sap['ui'][_0x37213f(0x1b5)]['IconPool'][_0x37213f(0x86)](_0x37213f(0x7a)),
                'press': function() {
                        var _0x3e4ad0 = _0x37213f
                          , _0x475fc8 = _0x9ee937[_0x3e4ad0(0x196)]()
                          , _0x236cd0 = _0x578bea[_0x3e4ad0(0x196)]()
                          , _0xc15274 = _0x4f0b70[_0x3e4ad0(0x196)]()
                          , _0x189dd3 = _0x118c1d[_0x3e4ad0(0x196)]()
                          , _0x5c8875 = _0x5e1501[_0x3e4ad0(0x196)]();
                        if (validation(_0x475fc8, oBundle[_0x3e4ad0(0x1af)](_0x3e4ad0(0x188))))
                                return;
                        if (validation(_0x236cd0, oBundle[_0x3e4ad0(0x1af)](_0x3e4ad0(0x1c7))))
                                return;
                        if (validation(_0x189dd3, oBundle[_0x3e4ad0(0x1af)](_0x3e4ad0(0x9b))))
                                return;
                        if (!nullCheck(_0x189dd3) || minusCheck(_0x189dd3) || parseFloat(_0x189dd3) < 0x1) {
                                sap['m'][_0x3e4ad0(0x1ac)][_0x3e4ad0(0x92)](oBundle[_0x3e4ad0(0x1af)](_0x3e4ad0(0x13d)) + '\x20' + oBundle[_0x3e4ad0(0x1af)](_0x3e4ad0(0x9b)), {
                                        'title': oBundle[_0x3e4ad0(0x1af)](_0x3e4ad0(0x100))
                                });
                                return;
                        }
                        var _0xd81784 = _0x49b968[_0x3e4ad0(0x1a4)]();
                        if (validation(_0xd81784, oBundle[_0x3e4ad0(0x1af)](_0x3e4ad0(0xdf))))
                                return;
                        var _0x36ca08 = _0x49b968[_0x3e4ad0(0x1a3)]()[_0x3e4ad0(0x1af)]();
                        busyDialog[_0x3e4ad0(0x157)](),
                        fuelbunkerTable['insert']({
                                'master_email': emailUser,
                                'tank_id': _0x475fc8,
                                'location': _0x236cd0,
                                'description': _0xc15274,
                                'capacity': _0x189dd3,
                                'unit': _0x5c8875,
                                'source': '1',
                                'location_id': _0xd81784,
                                'location_name': _0x36ca08,
                                'image_url': '',
                                'lat_long': '',
                                'app_source': ''
                        })[_0x3e4ad0(0x1c1)](function() {
                                var _0x300636 = _0x3e4ad0;
                                funGetFuelbunker(),
                                _0x2c5ffe[_0x300636(0x1ae)](),
                                busyDialog['close']();
                        });
                }
        })
          , _0x338de0 = new sap['m']['Button']({
                'text': oBundle[_0x37213f(0x1af)]('Update'),
                'icon': _0x37213f(0x162),
                'press': function() {
                        var _0x8c67c5 = _0x37213f
                          , _0x26f9cf = _0x9ee937['getValue']()
                          , _0x251bdf = _0x578bea[_0x8c67c5(0x196)]()
                          , _0x229bf8 = _0x4f0b70[_0x8c67c5(0x196)]()
                          , _0x4a89f9 = _0x118c1d[_0x8c67c5(0x196)]()
                          , _0x4dcf50 = _0x5e1501['getValue']()
                          , _0x15ed6e = _0x49b968[_0x8c67c5(0x1a4)]()
                          , _0x27178b = _0x49b968[_0x8c67c5(0x1a3)]()['getText']();
                        if (validation(_0x26f9cf, oBundle[_0x8c67c5(0x1af)]('tank_id')))
                                return;
                        if (validation(_0x251bdf, oBundle[_0x8c67c5(0x1af)](_0x8c67c5(0x1c7))))
                                return;
                        if (validation(_0x4a89f9, oBundle[_0x8c67c5(0x1af)](_0x8c67c5(0x9b))))
                                return;
                        if (!nullCheck(_0x4a89f9) || minusCheck(_0x4a89f9) || parseFloat(_0x4a89f9) < 0x1) {
                                sap['m'][_0x8c67c5(0x1ac)]['error'](oBundle['getText']('Invalid') + '\x20' + oBundle['getText'](_0x8c67c5(0x9b)), {
                                        'title': oBundle[_0x8c67c5(0x1af)]('Error')
                                });
                                return;
                        }
                        busyDialog[_0x8c67c5(0x157)](),
                        fuelbunkerTable['update']({
                                'id': _0x3a8fcd['id'],
                                'master_email': emailUser,
                                'tank_id': _0x26f9cf,
                                'location': _0x251bdf,
                                'description': _0x229bf8,
                                'capacity': _0x4a89f9,
                                'unit': _0x4dcf50,
                                'location_id': _0x15ed6e,
                                'location_name': _0x27178b
                        })['done'](function() {
                                var _0x43ff5c = _0x8c67c5;
                                funGetFuelbunker(),
                                _0x2c5ffe[_0x43ff5c(0x1ae)](),
                                busyDialog['close']();
                        });
                }
        })
          , _0x2c5ffe = new sap['m'][(_0x37213f(0x1cb))]({
                'draggable': !![],
                'resizable': !![],
                'contentWidth': '50%',
                'title': oBundle[_0x37213f(0x1af)](_0x37213f(0x79)),
                'content': [_0x510f59],
                'buttons': [_0x3275e2, _0x338de0, new sap['m']['Button']({
                        'text': oBundle[_0x37213f(0x1af)](_0x37213f(0x14c)),
                        'icon': _0x37213f(0xca),
                        'press': function() {
                                var _0x52a0f3 = _0x37213f;
                                _0x2c5ffe[_0x52a0f3(0x1ae)]();
                        }
                })]
        })['open']();
        _0x303f43 == 0x2 ? (_0x3275e2['setVisible'](![]),
        _0x338de0[_0x37213f(0xed)](!![]),
        _0x2c5ffe[_0x37213f(0x13e)](oBundle[_0x37213f(0x1af)](_0x37213f(0x79)))) : (_0x3275e2[_0x37213f(0xed)](!![]),
        _0x338de0[_0x37213f(0xed)](![]),
        _0x2c5ffe[_0x37213f(0x13e)](oBundle[_0x37213f(0x1af)](_0x37213f(0xa3))));
}
function addFuelBunkerQuantityDialog(_0x468419) {
        var _0x791eec = _0x27da71
          , _0x1729b9 = new sap['m'][(_0x791eec(0x11d))]({
                'text': oBundle['getText'](_0x791eec(0xa0))
        })
          , _0x39b2f6 = sessionStorage[_0x791eec(0x17d)]('hvi_currency')
          , _0x144b58 = new sap['m'][(_0x791eec(0xd6))]({
                'type': _0x791eec(0x16c),
                'value': '',
                'width': _0x791eec(0xcc),
                'description': _0x468419[_0x791eec(0x8d)]
        })
          , _0x2db3c9 = new sap['m'][(_0x791eec(0xd6))]({
                'type': 'Number',
                'value': '',
                'width': _0x791eec(0xcc),
                'description': _0x39b2f6
        })
          , _0x4df905 = new sap['m'][(_0x791eec(0x143))]({
                'width': '100%',
                'height': '70px',
                'rows': 0x2,
                'wrapping': sap['ui'][_0x791eec(0x1b5)][_0x791eec(0x1bf)]['on']
        })
          , _0x19c47c = new Date()['getTime']()
          , _0x3453fc = emailUser[_0x791eec(0x7c)](/[@.]/g, '')
          , _0x25a4c0 = _0x468419[_0x791eec(0x188)][_0x791eec(0x7c)](/[^.,a-zA-Z0-9]/g, '')
          , _0x1ecb3f = _0x25a4c0 + '_' + _0x19c47c + ''
          , _0x101015 = ''
          , _0x2c35a0 = new sap['ui'][(_0x791eec(0x74))][(_0x791eec(0x17f))]({
                'name': _0x791eec(0x1b6),
                'iconOnly': !![],
                'uploadUrl': 'https://heavyvehicleinspection.com/upload/bunker_receipt.php',
                'sendXHR': !![],
                'maximumFileSize': 0x1,
                'width': _0x791eec(0xcc),
                'icon': _0x791eec(0xad),
                'fileType': ['jpeg', _0x791eec(0x1c2), 'JPG', _0x791eec(0x14a), _0x791eec(0x154), _0x791eec(0xf8), _0x791eec(0x1b6), 'ppt', _0x791eec(0x153), 'xlsx', _0x791eec(0x141), 'jpeg', _0x791eec(0x1c2), 'png'],
                'placeholder': oBundle[_0x791eec(0x1af)]('Choose_a_file_for_uploading'),
                'parameters': [new sap['ui'][(_0x791eec(0x74))][(_0x791eec(0x1bd))]({
                        'name': _0x791eec(0x80),
                        'value': _0x1ecb3f
                }), new sap['ui'][(_0x791eec(0x74))][(_0x791eec(0x1bd))]({
                        'name': _0x791eec(0x14d),
                        'value': _0x3453fc
                })],
                'uploadProgress': function(_0x34ec74) {
                        var _0x1aadaf = _0x791eec, _0x10c93b, _0x1c9c26;
                        _0x34ec74[_0x1aadaf(0x12d)](_0x1aadaf(0x133)) && (_0x10c93b = _0x34ec74[_0x1aadaf(0x12d)]('loaded'),
                        _0x1c9c26 = _0x34ec74[_0x1aadaf(0x12d)](_0x1aadaf(0xb2)),
                        _0x1729b9[_0x1aadaf(0x13b)](Math[_0x1aadaf(0xab)](_0x10c93b / _0x1c9c26 * 0x64) + '%'));
                },
                'fileSizeExceed': function(_0x35aa65) {
                        var _0x102e6b = _0x791eec;
                        _0x1729b9[_0x102e6b(0x1ae)](),
                        sap['m']['MessageBox'][_0x102e6b(0x92)](_0x102e6b(0xe9), {
                                'title': oBundle[_0x102e6b(0x1af)](_0x102e6b(0x100))
                        });
                },
                'typeMissmatch': function(_0xc5ccb2) {
                        var _0x74083b = _0x791eec;
                        _0x1729b9['close'](),
                        sap['m']['MessageBox'][_0x74083b(0x92)](oBundle[_0x74083b(0x1af)](_0x74083b(0xb3)), {
                                'title': oBundle[_0x74083b(0x1af)]('Error')
                        });
                },
                'uploadAborted': function(_0x131bb0) {
                        var _0x21d02b = _0x791eec;
                        _0x1729b9[_0x21d02b(0x1ae)]();
                },
                'uploadComplete': function(_0xe23f0) {
                        var _0x126617 = _0x791eec;
                        _0x1729b9[_0x126617(0x1ae)]();
                        var _0x580f35 = _0xe23f0['getParameter'](_0x126617(0x1b7))[_0x126617(0x7c)](/"/g, '');
                        _0x101015 = _0x126617(0xe7) + _0x3453fc + '/' + _0x1ecb3f + '.' + _0x580f35,
                        _0x42fc35[_0x126617(0x146)](![]);
                }
        })
          , _0x42fc35 = new sap['m'][(_0x791eec(0x171))]({
                'text': oBundle[_0x791eec(0x1af)](_0x791eec(0x8e)),
                'icon': 'sap-icon://upload',
                'width': _0x791eec(0x194),
                'press': function() {
                        var _0x39cbb8 = _0x791eec;
                        _0x2c35a0[_0x39cbb8(0x196)]() != '' ? (_0x1729b9['open'](),
                        _0x2c35a0[_0x39cbb8(0xa2)]()) : sap['m'][_0x39cbb8(0x1ac)][_0x39cbb8(0x92)]('Select\x20file\x20for\x20upload', {
                                'title': oBundle['getText'](_0x39cbb8(0x100))
                        });
                }
        })
          , _0x49cee9 = new sap['ui']['layout'][(_0x791eec(0x8b))][(_0x791eec(0xcf))]({
                'editable': !![],
                'layout': new sap['ui'][(_0x791eec(0xdc))][(_0x791eec(0x8b))]['ResponsiveGridLayout'](),
                'formContainers': [new sap['ui'][(_0x791eec(0xdc))][(_0x791eec(0x8b))][(_0x791eec(0xeb))]({
                        'formElements': [new sap['ui'][(_0x791eec(0xdc))][(_0x791eec(0x8b))][(_0x791eec(0x113))]({
                                'label': new sap['m'][(_0x791eec(0x101))]({
                                        'text': oBundle[_0x791eec(0x1af)](_0x791eec(0x77))
                                }),
                                'fields': [new sap['m'][(_0x791eec(0xd6))]({
                                        'enabled': ![],
                                        'value': _0x468419[_0x791eec(0x188)],
                                        'width': _0x791eec(0xcc)
                                })]
                        }), new sap['ui'][(_0x791eec(0xdc))][(_0x791eec(0x8b))][(_0x791eec(0x113))]({
                                'label': new sap['m'][(_0x791eec(0x101))]({
                                        'required': !![],
                                        'text': oBundle[_0x791eec(0x1af)](_0x791eec(0xf1))
                                }),
                                'fields': [_0x144b58]
                        }), new sap['ui'][(_0x791eec(0xdc))][(_0x791eec(0x8b))][(_0x791eec(0x113))]({
                                'label': new sap['m'][(_0x791eec(0x101))]({
                                        'required': !![],
                                        'text': oBundle[_0x791eec(0x1af)](_0x791eec(0xbd))
                                }),
                                'fields': [_0x2db3c9]
                        }), new sap['ui'][(_0x791eec(0xdc))][(_0x791eec(0x8b))]['FormElement']({
                                'label': new sap['m']['Label']({
                                        'text': oBundle[_0x791eec(0x1af)](_0x791eec(0x12f))
                                }),
                                'fields': [_0x4df905]
                        }), new sap['ui'][(_0x791eec(0xdc))]['form'][(_0x791eec(0x113))]({
                                'label': new sap['m'][(_0x791eec(0x101))]({
                                        'text': oBundle[_0x791eec(0x1af)]('Receipt')
                                }),
                                'fields': [_0x2c35a0, _0x42fc35]
                        })]
                })]
        })
          , _0x52b681 = new sap['m'][(_0x791eec(0x1cb))]({
                'draggable': !![],
                'resizable': !![],
                'contentWidth': _0x791eec(0x125),
                'title': oBundle[_0x791eec(0x1af)](_0x791eec(0x148)),
                'content': [_0x49cee9],
                'buttons': [new sap['m'][(_0x791eec(0x171))]({
                        'text': oBundle[_0x791eec(0x1af)](_0x791eec(0x14e)),
                        'icon': _0x791eec(0xe4),
                        'press': function() {
                                var _0x49a68a = _0x791eec
                                  , _0x48d541 = _0x144b58[_0x49a68a(0x196)]()
                                  , _0x57a474 = _0x2db3c9[_0x49a68a(0x196)]()
                                  , _0x5ecf7f = _0x4df905['getValue']()
                                  , _0x2fa527 = getDate() + '\x20' + getTime()
                                  , _0x38bb86 = operatedBy;
                                if (validation(_0x48d541, oBundle[_0x49a68a(0x1af)](_0x49a68a(0x1be))))
                                        return;
                                if (validation(_0x57a474, oBundle[_0x49a68a(0x1af)]('Fuel_Cost')))
                                        return;
                                if (!nullCheck(_0x48d541) || minusCheck(_0x48d541)) {
                                        sap['m'][_0x49a68a(0x1ac)][_0x49a68a(0x92)](oBundle[_0x49a68a(0x1af)](_0x49a68a(0x13d)) + '\x20' + oBundle['getText'](_0x49a68a(0x1be)), {
                                                'title': oBundle[_0x49a68a(0x1af)](_0x49a68a(0x100))
                                        });
                                        return;
                                }
                                if (!nullCheck(_0x57a474) || minusCheck(_0x57a474)) {
                                        sap['m'][_0x49a68a(0x1ac)]['error'](oBundle['getText'](_0x49a68a(0x13d)) + '\x20' + oBundle[_0x49a68a(0x1af)]('Fuel_Cost'), {
                                                'title': oBundle[_0x49a68a(0x1af)]('Error')
                                        });
                                        return;
                                }
                                var _0x1a0bf1 = _0x468419[_0x49a68a(0x188)]
                                  , _0x21d467 = _0x468419[_0x49a68a(0x130)]
                                  , _0x76b131 = _0x468419[_0x49a68a(0x8d)];
                                if (_0x2c35a0['getValue']() != '' && _0x101015 == '') {
                                        sap['m'][_0x49a68a(0x1ac)][_0x49a68a(0x92)](oBundle['getText'](_0x49a68a(0xd9)), {
                                                'title': oBundle[_0x49a68a(0x1af)](_0x49a68a(0x100))
                                        });
                                        return;
                                }
                                busyDialog['open'](),
                                fuelbunkerTable['where']({
                                        'master_email': emailUser,
                                        'id': _0x468419['id']
                                })['read']()[_0x49a68a(0x1c1)](function(_0x3edd73) {
                                        var _0x1b14b5 = _0x49a68a;
                                        if (_0x3edd73['length'] > 0x0) {
                                                var _0x5e536d = 0x0
                                                  , _0x5337c3 = parseFloat(_0x48d541);
                                                nullCheck(_0x3edd73[0x0][_0x1b14b5(0xae)]) && (_0x5337c3 = parseFloat(_0x48d541) + parseFloat(_0x3edd73[0x0][_0x1b14b5(0xae)]),
                                                _0x5e536d = _0x3edd73[0x0]['fuel_level']);
                                                if (parseFloat(_0x5337c3) > parseFloat(_0x3edd73[0x0][_0x1b14b5(0x185)])) {
                                                        sap['m']['MessageBox'][_0x1b14b5(0x92)](oBundle[_0x1b14b5(0x1af)](_0x1b14b5(0xe6)), {
                                                                'title': oBundle[_0x1b14b5(0x1af)]('Error')
                                                        }),
                                                        busyDialog[_0x1b14b5(0x1ae)]();
                                                        return;
                                                }
                                                var _0x150ac0 = parseFloat(_0x57a474);
                                                nullCheck(_0x3edd73[0x0]['fuel_cost']) && (_0x150ac0 = parseFloat(_0x57a474) + parseFloat(_0x3edd73[0x0][_0x1b14b5(0x16d)]));
                                                var _0x264b7f = parseFloat(_0x150ac0) / parseFloat(_0x5337c3)
                                                  , _0x5886e7 = parseFloat(_0x57a474) / parseFloat(_0x48d541);
                                                _0x264b7f = twoDecimal(_0x264b7f),
                                                _0x5886e7 = twoDecimal(_0x5886e7),
                                                fuelbunkerTable[_0x1b14b5(0x119)]({
                                                        'id': _0x468419['id'],
                                                        'filling_date': _0x2fa527,
                                                        'fuel_level': _0x5337c3,
                                                        'unit_cost': _0x264b7f,
                                                        'fuel_cost': _0x150ac0
                                                })['done'](function() {
                                                        funGetFuelbunker();
                                                }),
                                                fuelbunkerHistoryTable['insert']({
                                                        'master_email': emailUser,
                                                        'tank_id': _0x1a0bf1,
                                                        'location': _0x21d467,
                                                        'description': _0x5ecf7f,
                                                        'filling_date': _0x2fa527,
                                                        'quantity': _0x48d541,
                                                        'unit': _0x76b131,
                                                        'unit_cost': _0x5886e7,
                                                        'fuel_cost': _0x57a474,
                                                        'receipt': _0x101015,
                                                        'old_quantity': _0x5e536d,
                                                        'new_quantity': _0x5337c3,
                                                        'refill_by': _0x38bb86,
                                                        'location_id': hvi_location_id
                                                })[_0x1b14b5(0x1c1)](function() {
                                                        var _0x268795 = _0x1b14b5;
                                                        funGetFuelbunker(),
                                                        _0x52b681[_0x268795(0x1ae)](),
                                                        busyDialog[_0x268795(0x1ae)]();
                                                });
                                        }
                                });
                        }
                }), new sap['m'][(_0x791eec(0x171))]({
                        'text': oBundle[_0x791eec(0x1af)]('Cancel'),
                        'icon': _0x791eec(0xca),
                        'press': function() {
                                var _0x3c9beb = _0x791eec;
                                _0x52b681[_0x3c9beb(0x1ae)]();
                        }
                })]
        })[_0x791eec(0x157)]();
}
function AddEditMobileBunkerDialog(_0x592892, _0x5515a1) {
        var _0x421c4b = _0x27da71
          , _0x5ed24a = new sap['m'][(_0x421c4b(0xd6))]({
                'editable': ![],
                'value': '',
                'width': '100%'
        })
          , _0x351a8a = new sap['m'][(_0x421c4b(0xd6))]({
                'value': '',
                'width': _0x421c4b(0xcc)
        })
          , _0x515877 = new sap['m']['Input']({
                'value': '',
                'width': _0x421c4b(0xcc)
        })
          , _0x11b12b = new sap['m'][(_0x421c4b(0xd6))]({
                'type': _0x421c4b(0x16c),
                'value': '',
                'width': _0x421c4b(0xcc)
        })
          , _0x2393b1 = new sap['m'][(_0x421c4b(0xbb))]();
        _0x2393b1[_0x421c4b(0x78)](new sap['ui'][(_0x421c4b(0x1b5))][(_0x421c4b(0xb9))]({
                'key': '1',
                'text': oBundle['getText'](_0x421c4b(0x102))
        })),
        _0x2393b1[_0x421c4b(0x78)](new sap['ui'][(_0x421c4b(0x1b5))][(_0x421c4b(0xb9))]({
                'key': '2',
                'text': oBundle[_0x421c4b(0x1af)](_0x421c4b(0x8f))
        })),
        _0x2393b1['setSelectedKey']('1'),
        _0x2393b1[_0x421c4b(0x11a)]({
                'onAfterRendering': function(_0x4947c3) {
                        var _0x35766 = _0x421c4b;
                        _0x2393b1['$']()[_0x35766(0x106)](_0x35766(0x127))[_0x35766(0x1ab)]('readonly', !![]);
                }
        });
        var _0x8226d2 = new sap['m']['ComboBox']({
                'width': _0x421c4b(0xcc),
                'items': {
                        'path': '/modelData',
                        'template': new sap['ui'][(_0x421c4b(0x1b5))][(_0x421c4b(0xb9))]({
                                'key': '{location_id}',
                                'text': '{location_name}'
                        })
                }
        });
        _0x8226d2[_0x421c4b(0x11a)]({
                'onAfterRendering': function(_0xb7cae4) {
                        var _0x22588a = _0x421c4b;
                        _0x8226d2['$']()['find'](_0x22588a(0x127))[_0x22588a(0x1ab)]('readonly', !![]);
                }
        });
        var _0x83ed4c = new sap['ui'][(_0x421c4b(0x14f))][(_0x421c4b(0x145))][(_0x421c4b(0x129))]();
        _0x83ed4c[_0x421c4b(0x134)]({
                'modelData': emailJSONLocation
        }),
        _0x8226d2[_0x421c4b(0x117)](_0x83ed4c);
        if (_0x5515a1 == 0x2)
                _0x5ed24a['setValue'](_0x592892[_0x421c4b(0x188)]),
                _0x351a8a[_0x421c4b(0x173)](_0x592892[_0x421c4b(0x130)]),
                _0x515877['setValue'](_0x592892[_0x421c4b(0xb8)]),
                _0x11b12b[_0x421c4b(0x173)](_0x592892[_0x421c4b(0x185)]),
                _0x2393b1[_0x421c4b(0x173)](_0x592892['unit']),
                _0x8226d2['setSelectedKey'](_0x592892[_0x421c4b(0x164)]);
        else {
                var _0x2b9283 = emailJSONFuelbunker[_0x421c4b(0x12e)](function(_0x243aa4, _0xfb7d2) {
                        var _0x189c66 = _0x421c4b;
                        return _0x243aa4[_0x189c66(0x13c)] == '2';
                });
                _0x5ed24a[_0x421c4b(0x173)](_0x421c4b(0xf7) + (_0x2b9283['length'] + 0x1));
        }
        var _0x5bf43d = new sap['ui'][(_0x421c4b(0xdc))][(_0x421c4b(0x8b))][(_0x421c4b(0xcf))]({
                'editable': !![],
                'layout': new sap['ui']['layout'][(_0x421c4b(0x8b))][(_0x421c4b(0x1a2))](),
                'formContainers': [new sap['ui'][(_0x421c4b(0xdc))]['form']['FormContainer']({
                        'formElements': [new sap['ui'][(_0x421c4b(0xdc))][(_0x421c4b(0x8b))][(_0x421c4b(0x113))]({
                                'label': new sap['m'][(_0x421c4b(0x101))]({
                                        'required': !![],
                                        'text': oBundle[_0x421c4b(0x1af)](_0x421c4b(0x181))
                                }),
                                'fields': [_0x5ed24a]
                        }), new sap['ui'][(_0x421c4b(0xdc))][(_0x421c4b(0x8b))][(_0x421c4b(0x113))]({
                                'label': new sap['m']['Label']({
                                        'required': !![],
                                        'text': oBundle[_0x421c4b(0x1af)](_0x421c4b(0xfc))
                                }),
                                'fields': [new sap['ui'][(_0x421c4b(0xdc))]['HorizontalLayout']({
                                        'content': [_0x11b12b, _0x2393b1]
                                })]
                        }), new sap['ui'][(_0x421c4b(0xdc))][(_0x421c4b(0x8b))][(_0x421c4b(0x113))]({
                                'label': new sap['m'][(_0x421c4b(0x101))]({
                                        'required': !![],
                                        'text': oBundle[_0x421c4b(0x1af)](_0x421c4b(0x1c7))
                                }),
                                'fields': [_0x351a8a]
                        }), new sap['ui'][(_0x421c4b(0xdc))][(_0x421c4b(0x8b))][(_0x421c4b(0x113))]({
                                'label': new sap['m'][(_0x421c4b(0x101))]({
                                        'required': !![],
                                        'text': oBundle[_0x421c4b(0x1af)]('Site')
                                }),
                                'fields': [_0x8226d2]
                        }), new sap['ui'][(_0x421c4b(0xdc))][(_0x421c4b(0x8b))]['FormElement']({
                                'label': new sap['m']['Label']({
                                        'text': oBundle['getText'](_0x421c4b(0x112))
                                }),
                                'fields': [_0x515877]
                        })]
                })]
        })
          , _0x408941 = new sap['m'][(_0x421c4b(0x171))]({
                'text': oBundle[_0x421c4b(0x1af)](_0x421c4b(0x166)),
                'icon': sap['ui']['core'][_0x421c4b(0x170)][_0x421c4b(0x86)](_0x421c4b(0x7a)),
                'press': function() {
                        var _0x4c557c = _0x421c4b
                          , _0x1e0838 = _0x5ed24a[_0x4c557c(0x196)]()
                          , _0xe710d7 = _0x351a8a[_0x4c557c(0x196)]()
                          , _0x1089fe = _0x515877['getValue']()
                          , _0x479625 = _0x11b12b[_0x4c557c(0x196)]()
                          , _0x13dadf = _0x2393b1[_0x4c557c(0x196)]();
                        if (validation(_0x1e0838, oBundle[_0x4c557c(0x1af)]('Truck_ID')))
                                return;
                        if (validation(_0xe710d7, oBundle[_0x4c557c(0x1af)](_0x4c557c(0x1c7))))
                                return;
                        if (validation(_0x479625, oBundle[_0x4c557c(0x1af)](_0x4c557c(0x132))))
                                return;
                        if (!nullCheck(_0x479625) || minusCheck(_0x479625)) {
                                sap['m']['MessageBox'][_0x4c557c(0x92)](oBundle[_0x4c557c(0x1af)](_0x4c557c(0x13d)) + '\x20' + oBundle[_0x4c557c(0x1af)](_0x4c557c(0x132)), {
                                        'title': oBundle['getText'](_0x4c557c(0x100))
                                });
                                return;
                        }
                        var _0x2edde4 = _0x8226d2[_0x4c557c(0x1a4)]();
                        if (validation(_0x2edde4, oBundle[_0x4c557c(0x1af)](_0x4c557c(0xdf))))
                                return;
                        var _0x1a93e3 = _0x8226d2[_0x4c557c(0x1a3)]()[_0x4c557c(0x1af)]();
                        busyDialog[_0x4c557c(0x157)](),
                        fuelbunkerTable['insert']({
                                'master_email': emailUser,
                                'tank_id': _0x1e0838,
                                'location': _0xe710d7,
                                'description': _0x1089fe,
                                'capacity': _0x479625,
                                'unit': _0x13dadf,
                                'source': '2',
                                'location_id': _0x2edde4,
                                'location_name': _0x1a93e3
                        })[_0x4c557c(0x1c1)](function() {
                                var _0x54a3c9 = _0x4c557c;
                                funGetFuelbunker(),
                                _0x5c4a8d[_0x54a3c9(0x1ae)](),
                                busyDialog['close']();
                        });
                }
        })
          , _0x4b7f66 = new sap['m']['Button']({
                'text': oBundle[_0x421c4b(0x1af)](_0x421c4b(0xcb)),
                'icon': _0x421c4b(0x162),
                'press': function() {
                        var _0x315d23 = _0x421c4b
                          , _0x747706 = _0x5ed24a['getValue']()
                          , _0x1cf3c3 = _0x351a8a['getValue']()
                          , _0x53078e = _0x515877['getValue']()
                          , _0x2d6487 = _0x11b12b['getValue']()
                          , _0x19018b = _0x2393b1[_0x315d23(0x196)]();
                        if (validation(_0x747706, oBundle['getText'](_0x315d23(0x181))))
                                return;
                        if (validation(_0x1cf3c3, oBundle['getText'](_0x315d23(0x1c7))))
                                return;
                        if (validation(_0x2d6487, oBundle[_0x315d23(0x1af)](_0x315d23(0x132))))
                                return;
                        if (!nullCheck(_0x2d6487) || minusCheck(_0x2d6487)) {
                                sap['m'][_0x315d23(0x1ac)][_0x315d23(0x92)](oBundle['getText'](_0x315d23(0x13d)) + '\x20' + oBundle[_0x315d23(0x1af)](_0x315d23(0x132)), {
                                        'title': oBundle['getText']('Error')
                                });
                                return;
                        }
                        var _0x4cf27d = _0x8226d2['getSelectedKey']()
                          , _0x1132c8 = _0x8226d2[_0x315d23(0x1a3)]()[_0x315d23(0x1af)]();
                        busyDialog['open'](),
                        fuelbunkerTable[_0x315d23(0x119)]({
                                'id': _0x592892['id'],
                                'master_email': emailUser,
                                'tank_id': _0x747706,
                                'location': _0x1cf3c3,
                                'description': _0x53078e,
                                'capacity': _0x2d6487,
                                'unit': _0x19018b,
                                'location_id': _0x4cf27d,
                                'location_name': _0x1132c8
                        })[_0x315d23(0x1c1)](function() {
                                var _0x316f30 = _0x315d23;
                                funGetFuelbunker(),
                                _0x5c4a8d['close'](),
                                busyDialog[_0x316f30(0x1ae)]();
                        });
                }
        })
          , _0x5c4a8d = new sap['m'][(_0x421c4b(0x1cb))]({
                'draggable': !![],
                'resizable': !![],
                'contentWidth': '50%',
                'content': [_0x5bf43d],
                'buttons': [_0x408941, _0x4b7f66, new sap['m'][(_0x421c4b(0x171))]({
                        'text': oBundle['getText'](_0x421c4b(0x14c)),
                        'icon': _0x421c4b(0xca),
                        'press': function() {
                                var _0x4cd49e = _0x421c4b;
                                _0x5c4a8d[_0x4cd49e(0x1ae)]();
                        }
                })]
        })['open']();
        _0x5515a1 == 0x2 ? (_0x408941[_0x421c4b(0xed)](![]),
        _0x4b7f66['setVisible'](!![]),
        _0x5c4a8d[_0x421c4b(0x13e)](oBundle[_0x421c4b(0x1af)]('Edit_Fuel_Truck'))) : (_0x408941[_0x421c4b(0xed)](!![]),
        _0x4b7f66['setVisible'](![]),
        _0x5c4a8d[_0x421c4b(0x13e)](oBundle[_0x421c4b(0x1af)](_0x421c4b(0xa9))));
}
var fuelBunkerTankDB = new sap['m'][(_0x27da71(0x16e))]({
        'showSecondaryValues': !![]
});
function addMobileBunkerQuantityDialog(_0x4b2fbb) {
        var _0x60ed51 = _0x27da71
          , _0x49626b = new sap['m'][(_0x60ed51(0xd6))]({
                'type': _0x60ed51(0x16c),
                'value': '',
                'width': _0x60ed51(0xcc),
                'description': _0x4b2fbb[_0x60ed51(0x8d)]
        })
          , _0x33785d = new sap['m']['TextArea']({
                'width': _0x60ed51(0xcc),
                'height': _0x60ed51(0x10a),
                'rows': 0x2,
                'wrapping': sap['ui']['core']['Wrapping']['on']
        })
          , _0x4db91b = new sap['ui'][(_0x60ed51(0xdc))][(_0x60ed51(0x8b))][(_0x60ed51(0xcf))]({
                'editable': !![],
                'layout': new sap['ui'][(_0x60ed51(0xdc))][(_0x60ed51(0x8b))][(_0x60ed51(0x1a2))](),
                'formContainers': [new sap['ui'][(_0x60ed51(0xdc))][(_0x60ed51(0x8b))][(_0x60ed51(0xeb))]({
                        'formElements': [new sap['ui'][(_0x60ed51(0xdc))]['form'][(_0x60ed51(0x113))]({
                                'label': new sap['m'][(_0x60ed51(0x101))]({
                                        'text': oBundle['getText'](_0x60ed51(0x181))
                                }),
                                'fields': [new sap['m'][(_0x60ed51(0xd6))]({
                                        'enabled': ![],
                                        'value': _0x4b2fbb[_0x60ed51(0x188)],
                                        'width': _0x60ed51(0xcc)
                                })]
                        }), new sap['ui'][(_0x60ed51(0xdc))][(_0x60ed51(0x8b))][(_0x60ed51(0x113))]({
                                'label': new sap['m']['Label']({
                                        'text': oBundle[_0x60ed51(0x1af)](_0x60ed51(0x15d))
                                }),
                                'fields': [fuelBunkerTankDB]
                        }), new sap['ui']['layout'][(_0x60ed51(0x8b))]['FormElement']({
                                'label': new sap['m'][(_0x60ed51(0x101))]({
                                        'required': !![],
                                        'text': oBundle['getText'](_0x60ed51(0xf1))
                                }),
                                'fields': [_0x49626b]
                        }), new sap['ui'][(_0x60ed51(0xdc))][(_0x60ed51(0x8b))][(_0x60ed51(0x113))]({
                                'label': new sap['m']['Label']({
                                        'text': oBundle[_0x60ed51(0x1af)](_0x60ed51(0x12f))
                                }),
                                'fields': [_0x33785d]
                        })]
                })]
        })
          , _0x15f72f = new sap['m'][(_0x60ed51(0x1cb))]({
                'draggable': !![],
                'resizable': !![],
                'contentWidth': _0x60ed51(0x125),
                'title': oBundle[_0x60ed51(0x1af)]('Fuel_Truck_Refilling'),
                'content': [_0x4db91b],
                'buttons': [new sap['m'][(_0x60ed51(0x171))]({
                        'text': oBundle['getText']('Add_Fuel'),
                        'icon': _0x60ed51(0xe4),
                        'press': function() {
                                var _0x44cdb4 = _0x60ed51
                                  , _0x461560 = getDate() + '\x20' + getTime()
                                  , _0x26cc74 = operatedBy
                                  , _0x314f2e = _0x49626b[_0x44cdb4(0x196)]()
                                  , _0x3f915e = _0x33785d[_0x44cdb4(0x196)]()
                                  , _0x343337 = fuelBunkerTankDB[_0x44cdb4(0x1a4)]();
                                if (validation(_0x343337, oBundle[_0x44cdb4(0x1af)](_0x44cdb4(0xf5))))
                                        return;
                                if (validation(_0x314f2e, oBundle[_0x44cdb4(0x1af)]('Fuel_Quantity')))
                                        return;
                                if (_0x343337 == _0x4b2fbb[_0x44cdb4(0x188)]) {
                                        sap['m'][_0x44cdb4(0x1ac)][_0x44cdb4(0x92)](_0x44cdb4(0xb0), {
                                                'title': oBundle[_0x44cdb4(0x1af)](_0x44cdb4(0x100))
                                        });
                                        return;
                                }
                                if (!nullCheck(_0x314f2e) || minusCheck(_0x314f2e)) {
                                        sap['m']['MessageBox'][_0x44cdb4(0x92)](oBundle['getText'](_0x44cdb4(0x13d)) + '\x20' + oBundle[_0x44cdb4(0x1af)](_0x44cdb4(0x1be)), {
                                                'title': oBundle[_0x44cdb4(0x1af)](_0x44cdb4(0x100))
                                        });
                                        return;
                                }
                                var _0x391f41 = emailJSONFuelbunker[_0x44cdb4(0x12e)](function(_0x589264, _0x1398a1) {
                                        var _0x39a7d6 = _0x44cdb4;
                                        return _0x589264[_0x39a7d6(0x188)] == _0x343337;
                                });
                                busyDialog['open'](),
                                fuelbunkerTable['where']({
                                        'master_email': emailUser,
                                        'id': _0x391f41[0x0]['id']
                                })['read']()[_0x44cdb4(0x1c1)](function(_0x5b2de0) {
                                        var _0x29c42c = _0x44cdb4;
                                        if (_0x5b2de0['length'] > 0x0) {
                                                var _0x4722a0 = parseFloat(_0x5b2de0[0x0]['fuel_level']) - parseFloat(_0x314f2e)
                                                  , _0x220548 = parseFloat(_0x5b2de0[0x0]['unit_cost']) * parseFloat(_0x4722a0);
                                                if (!nullCheck(_0x5b2de0[0x0][_0x29c42c(0xae)]) || _0x4722a0 < 0x0) {
                                                        sap['m'][_0x29c42c(0x1ac)][_0x29c42c(0x92)](oBundle['getText'](_0x29c42c(0xd2)), {
                                                                'title': oBundle[_0x29c42c(0x1af)](_0x29c42c(0x100))
                                                        }),
                                                        busyDialog[_0x29c42c(0x1ae)]();
                                                        return;
                                                }
                                                fuelbunkerTable[_0x29c42c(0x17a)]({
                                                        'master_email': emailUser,
                                                        'id': _0x4b2fbb['id']
                                                })[_0x29c42c(0xe1)]()['done'](function(_0x323195) {
                                                        var _0x129eb9 = _0x29c42c;
                                                        if (_0x323195['length'] > 0x0) {
                                                                var _0x299c0c = _0x323195[0x0][_0x129eb9(0x188)]
                                                                  , _0xe088fb = _0x323195[0x0]['location']
                                                                  , _0x4091df = _0x323195[0x0][_0x129eb9(0x8d)]
                                                                  , _0x140c4e = '0'
                                                                  , _0x549e06 = parseFloat(_0x314f2e);
                                                                nullCheck(_0x323195[0x0][_0x129eb9(0xae)]) && (_0x549e06 = parseFloat(_0x314f2e) + parseFloat(_0x323195[0x0][_0x129eb9(0xae)]),
                                                                _0x140c4e = _0x323195[0x0][_0x129eb9(0xae)]);
                                                                var _0x34984b = 0x0;
                                                                nullCheck(_0x5b2de0[0x0]['unit_cost']) && (_0x34984b = parseFloat(_0x5b2de0[0x0][_0x129eb9(0x95)]) * parseFloat(_0x314f2e));
                                                                var _0x29be43 = _0x34984b;
                                                                nullCheck(_0x323195[0x0]['fuel_cost']) && (_0x34984b = parseFloat(_0x34984b) + parseFloat(_0x323195[0x0][_0x129eb9(0x16d)]));
                                                                var _0x105b41 = parseFloat(_0x34984b) / parseFloat(_0x549e06);
                                                                _0x105b41 = twoDecimal(_0x105b41);
                                                                if (parseFloat(_0x549e06) > parseFloat(_0x323195[0x0][_0x129eb9(0x185)])) {
                                                                        sap['m'][_0x129eb9(0x1ac)][_0x129eb9(0x92)](oBundle[_0x129eb9(0x1af)](_0x129eb9(0xe6)), {
                                                                                'title': oBundle['getText'](_0x129eb9(0x100))
                                                                        }),
                                                                        busyDialog[_0x129eb9(0x1ae)]();
                                                                        return;
                                                                }
                                                                fuelbunkerTable['update']({
                                                                        'id': _0x5b2de0[0x0]['id'],
                                                                        'fuel_level': _0x4722a0,
                                                                        'fuel_cost': _0x220548
                                                                })[_0x129eb9(0x1c1)](function() {}),
                                                                fuelbunkerTable[_0x129eb9(0x119)]({
                                                                        'id': _0x4b2fbb['id'],
                                                                        'filling_date': _0x461560,
                                                                        'fuel_level': _0x549e06,
                                                                        'unit_cost': _0x105b41,
                                                                        'fuel_cost': _0x34984b,
                                                                        'source_tank_id': _0x343337
                                                                })[_0x129eb9(0x1c1)](function() {
                                                                        var _0x1fbff5 = _0x129eb9;
                                                                        funGetFuelbunker(),
                                                                        _0x15f72f[_0x1fbff5(0x1ae)](),
                                                                        busyDialog[_0x1fbff5(0x1ae)]();
                                                                }),
                                                                fuelbunkerHistoryTable[_0x129eb9(0x88)]({
                                                                        'master_email': emailUser,
                                                                        'tank_id': _0x299c0c,
                                                                        'location': _0xe088fb,
                                                                        'description': _0x3f915e,
                                                                        'filling_date': _0x461560,
                                                                        'quantity': _0x314f2e,
                                                                        'unit': _0x4091df,
                                                                        'unit_cost': _0x5b2de0[0x0][_0x129eb9(0x95)],
                                                                        'fuel_cost': _0x29be43,
                                                                        'source_tank_id': _0x343337,
                                                                        'old_quantity': _0x140c4e,
                                                                        'new_quantity': _0x549e06,
                                                                        'refill_by': _0x26cc74,
                                                                        'location_id': hvi_location_id
                                                                })['done'](function() {
                                                                        funGetFuelbunker();
                                                                });
                                                        }
                                                });
                                                var _0x1a8fc4 = sessionStorage[_0x29c42c(0x17d)](_0x29c42c(0x7b))
                                                  , _0x31654f = _0x4722a0 / parseFloat(_0x5b2de0[0x0][_0x29c42c(0x185)]) * 0x64
                                                  , _0x21fd89 = 0x1e;
                                                _0x1a8fc4 != null && (_0x21fd89 = _0x1a8fc4);
                                                if (_0x31654f < _0x21fd89)
                                                        for (var _0x336000 = 0x0; _0x336000 < notificationEmailArray[_0x29c42c(0x11e)]; _0x336000++) {
                                                                notificationEmailArray[_0x336000][_0x29c42c(0x18c)] == '1' && funkerAlertMail(_0x5b2de0[0x0], _0x4722a0, _0x31654f, notificationEmailArray[_0x336000][_0x29c42c(0x180)]);
                                                        }
                                        }
                                });
                        }
                }), new sap['m'][(_0x60ed51(0x171))]({
                        'text': oBundle[_0x60ed51(0x1af)]('Cancel'),
                        'icon': _0x60ed51(0xca),
                        'press': function() {
                                var _0xb0287a = _0x60ed51;
                                _0x15f72f[_0xb0287a(0x1ae)]();
                        }
                })]
        })[_0x60ed51(0x157)]();
}
function funkerAlertMail(_0xaa238f, _0x521903, _0x47ad7a, _0x28c749) {
        var _0x435765 = _0x27da71
          , _0x22ae10 = _0xaa238f[_0x435765(0x188)]
          , _0x599f79 = _0xaa238f[_0x435765(0x130)]
          , _0xb47d3a = _0xaa238f[_0x435765(0x185)]
          , _0x58a6dc = _0xaa238f[_0x435765(0x1a1)]
          , _0x3ae432 = _0xaa238f[_0x435765(0xb8)]
          , _0x523c5c = _0xaa238f[_0x435765(0x8d)];
        $[_0x435765(0x1a0)]({
                'type': _0x435765(0x137),
                'url': _0x435765(0xff),
                'data': {
                        'email': _0x28c749,
                        'capacity': _0xb47d3a,
                        'fuel_level': _0x521903,
                        'tank_id': _0x22ae10,
                        'location': _0x599f79,
                        'filling_date': _0x58a6dc,
                        'description': _0x3ae432,
                        'persValue': twoDecimal(_0x47ad7a),
                        'unit': _0x523c5c
                },
                'success': function(_0x290b43) {}
        });
}
var emailJSONFuelbunker = [];
function funGetFuelbunker() {
        var _0x54a2b5 = _0x27da71;
        fuelConsumptionChart['setBusy'](!![]),
        fuelBunkerStatusIndicator[_0x54a2b5(0x111)](!![]),
        oTableFuel_Bunker[_0x54a2b5(0x111)](!![]),
        fuelbunkerTable[_0x54a2b5(0x17a)](queryUserEmailBunker(0x1))[_0x54a2b5(0x12a)]()[_0x54a2b5(0xa6)](0x32)['orderByDescending'](_0x54a2b5(0x19e))['read']()['done'](function(_0x35e2a8) {
                var _0x5f1651 = _0x54a2b5
                  , _0x28d398 = new sap['ui']['model'][(_0x5f1651(0x145))][(_0x5f1651(0x129))]();
                _0x28d398[_0x5f1651(0x134)]({
                        'modelData': _0x35e2a8
                }),
                oTableFuel_Bunker['setModel'](_0x28d398),
                oTableFuel_Bunker[_0x5f1651(0x18b)]({
                        'path': _0x5f1651(0xe3),
                        'template': Fuel_Bunker_Template
                }),
                oTableFuel_Bunker[_0x5f1651(0x111)](![]);
                if (_0x35e2a8['length'] > 0x0) {
                        var _0x3e78ea = _0x35e2a8[0x0][_0x5f1651(0x185)]
                          , _0x65f435 = _0x35e2a8[0x0][_0x5f1651(0xae)]
                          , _0x4e954b = _0x35e2a8[0x0][_0x5f1651(0x8d)]
                          , _0x3f780c = _0x65f435 / _0x3e78ea * 0x64;
                        fuelBunkerStatusIndicator[_0x5f1651(0x108)](new sap[(_0x5f1651(0xc0))]['ui'][(_0x5f1651(0xc2))]['statusindicator'][(_0x5f1651(0x1b4))]({
                                'fillColor': _0x5f1651(0x179),
                                'toValue': 0x1e
                        })),
                        fuelBunkerStatusIndicator['addPropertyThreshold'](new sap[(_0x5f1651(0xc0))]['ui']['commons']['statusindicator']['PropertyThreshold']({
                                'fillColor': '#FCE903',
                                'toValue': 0x46
                        })),
                        fuelBunkerStatusIndicator[_0x5f1651(0x108)](new sap[(_0x5f1651(0xc0))]['ui']['commons'][(_0x5f1651(0x178))][(_0x5f1651(0x1b4))]({
                                'fillColor': '#19A979',
                                'toValue': 0x64
                        })),
                        fuelBunkerStatusIndicator[_0x5f1651(0x173)](_0x3f780c);
                } else
                        fuelBunkerStatusIndicator[_0x5f1651(0x173)](0x0);
                fuelBunkerStatusIndicator[_0x5f1651(0x111)](![]);
        }),
        funGetMobilebunker(),
        funGetAdjustHistory(),
        fuelbunkerHistoryTable['where'](queryMasterEmail(0x1))['includeTotalCount']()[_0x54a2b5(0xa6)](0x32)['orderByDescending'](_0x54a2b5(0x15f))[_0x54a2b5(0xe1)]()['done'](function(_0x422e1e) {
                var _0x3e1b5a = _0x54a2b5
                  , _0x1ca7f4 = 0x0
                  , _0x225db0 = _0x3e1b5a(0x102);
                for (var _0x4b73aa = 0x0; _0x4b73aa < _0x422e1e[_0x3e1b5a(0x11e)]; _0x4b73aa++) {
                        var _0x133e5a = parseFloat(_0x422e1e[_0x4b73aa][_0x3e1b5a(0xd5)])
                          , _0x1d3c38 = _0x422e1e[_0x4b73aa]['filling_date'];
                        _0x225db0 = _0x422e1e[_0x4b73aa][_0x3e1b5a(0x8d)];
                        var _0x4159e7 = new Date(_0x1d3c38);
                        segmentedDate1 <= _0x4159e7 && _0x4159e7 <= segmentedDate2 && (_0x1ca7f4 = _0x1ca7f4 + _0x133e5a);
                }
                fuelConsumptionBar1[_0x3e1b5a(0x1c6)](oBundle['getText'](_0x3e1b5a(0x169))),
                fuelConsumptionBar2[_0x3e1b5a(0x1c6)](oBundle[_0x3e1b5a(0x1af)](_0x3e1b5a(0xa8))),
                fuelConsumptionBar1[_0x3e1b5a(0x173)](_0x1ca7f4),
                fuelConsumptionBar2[_0x3e1b5a(0x173)](fuelConsumption),
                fuelConsumptionBar1['setDisplayValue'](_0x1ca7f4 + '\x20' + _0x225db0),
                fuelConsumptionBar2['setDisplayValue'](fuelConsumption + '\x20' + _0x225db0),
                fuelConsumptionChart[_0x3e1b5a(0x111)](![]);
                var _0x83cd49 = new sap['ui'][(_0x3e1b5a(0x14f))]['json'][(_0x3e1b5a(0x129))]();
                _0x83cd49['setData']({
                        'modelData': _0x422e1e
                }),
                oTableFuel_Bunker_History[_0x3e1b5a(0x117)](_0x83cd49),
                _0x83cd49['setSizeLimit'](_0x422e1e[_0x3e1b5a(0x11e)]),
                oTableFuel_Bunker_History['bindItems']({
                        'path': _0x3e1b5a(0xe3),
                        'template': Fuel_Bunker_HistoryTemplate
                });
        });
}
function funGetMobilebunker() {
        var _0x51e1d6 = _0x27da71;
        oTableMobileBunker[_0x51e1d6(0x111)](!![]),
        fuelbunkerTable[_0x51e1d6(0x17a)](queryUserEmailBunker(0x2))['includeTotalCount']()[_0x51e1d6(0xa6)](0x32)[_0x51e1d6(0x1c5)]('__createdAt')[_0x51e1d6(0xe1)]()['done'](function(_0x507166) {
                var _0x2237b1 = _0x51e1d6
                  , _0x5892b6 = new sap['ui'][(_0x2237b1(0x14f))][(_0x2237b1(0x145))][(_0x2237b1(0x129))]();
                _0x5892b6[_0x2237b1(0x134)]({
                        'modelData': _0x507166
                }),
                oTableMobileBunker[_0x2237b1(0x117)](_0x5892b6),
                oTableMobileBunker['bindItems']({
                        'path': _0x2237b1(0xe3),
                        'template': mobileBunkerTemplate
                }),
                oTableMobileBunker[_0x2237b1(0x111)](![]);
        }),
        funGetAllbunker();
}
function funGetAllbunker() {
        var _0x348b46 = _0x27da71;
        oTableMobileBunker[_0x348b46(0x111)](!![]),
        fuelbunkerTable[_0x348b46(0x17a)]({
                'master_email': emailUser
        })['includeTotalCount']()[_0x348b46(0xa6)](0x32)[_0x348b46(0x1c5)](_0x348b46(0x15f))[_0x348b46(0xe1)]()['done'](function(_0x2e716f) {
                var _0x32b588 = _0x348b46;
                emailJSONFuelbunker = _0x2e716f;
                var _0x2447ab = new sap['ui'][(_0x32b588(0x14f))]['json'][(_0x32b588(0x129))]();
                _0x2447ab[_0x32b588(0x134)]({
                        'modelData': _0x2e716f
                }),
                fuelBunkerTankDB[_0x32b588(0x117)](_0x2447ab);
                var _0x30e7db = new sap['ui'][(_0x32b588(0x1b5))]['ListItem']();
                _0x30e7db[_0x32b588(0x128)]('key', _0x32b588(0x188)),
                _0x30e7db[_0x32b588(0x128)](_0x32b588(0xaf), 'tank_id'),
                _0x30e7db[_0x32b588(0x128)](_0x32b588(0x1ba), _0x32b588(0x130)),
                fuelBunkerTankDB[_0x32b588(0x18b)](_0x32b588(0xe3), _0x30e7db);
        });
}
