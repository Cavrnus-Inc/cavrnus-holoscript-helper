import cav, { Float4, PropertyId, PropertyIdT } from '@cavrnus/runtime';

export function setupRotatorWithSpeedProp(propGroup : PropertyIdT, initialRotationRate : number) : PropertyIdT
{
    var ops = cav.beginOperations({});
    var rsId = PropertyId.push(propGroup, "rotatorSpeed");
    ops.prop.defineScalarProperty(rsId,
        { meta: { base: { category: 'Transform', name: 'Rotator Speed', description: 'Rotator Speed' }, edit: { uiMinimum: -10, uiMaximum: 10 } },
            default: initialRotationRate
        });
    ops.prop.updateTransformProperty(PropertyId.push(propGroup, "transform"), 
    {
        assignmentId: "rotator",
        modifyOrder: 1,
        modifyValue: 
            { addEulerRotation: 
                { offsetRotationEuler: { byChannel: 
                        { x: {expr:"ref('/room/rotatorTime')*ref('rotatorSpeed')" }}}}}
    });
    ops.commit();

    return rsId;
}

let rotatorTime = cav.setup(()=>
{
    var ops = cav.beginOperations({});
    var rtId = PropertyId.new("/room/rotatorTime");
    ops.prop.defineScalarProperty(rtId, {
        default: 0,
        meta: {base:{category:"Transform", description:"Time value for rotators set up with setupRotator module.", name: "Rotator Time"}}
    });
    ops.prop.updateScalarPropertyValue(rtId, {expr:"ref('t')"});
    ops.commit();
    return rtId;
}, (timeProp:PropertyIdT)=>
{
    // Do stuff every run
}, (timeProp:PropertyIdT)=>
{
    // shut down
}, 'setupRotatorTime');

export function arg(x:number) : string { return ""+x; }