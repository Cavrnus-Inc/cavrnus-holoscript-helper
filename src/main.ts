import cav, { out, Rand, Shape, AABB, Sphere } from '@cavrnus/runtime';

out.warn(`Welcome to Holoscript!`);


// Example Holoscript concepts follow. Delete them when you begin your own work!

// Create a new room property
// These properties will then show up in the space properties panel.
cav.prop.declareBooleanProperty("/room/testBoolean", 
	{default:false, meta:{base:{name:"Test Boolean!", description:"Just A Holoscript Template Example", category:"Testing",categoryOrder:-50}}});


	
// Setup a timer, which triggers every 10 seconds, but only if the boolean above is true, which changes the skybox intensity of the space.
cav.on({activeWhile:'/room/testBoolean'})
	.timer({delay:10,repeatDelay:10})
	.then(v=>{
		let ops = cav.beginAutoCommitOperations(); // auto-commit means that changes made using this object are pushed to the journal and all connected users. It means it is permanent!

		// Two ways to edit a property; use the ops, or use an editable view:

		// option 1:
		if (true)
		{
			//ops.prop.updateScalar("/room/skyboxIntensity", Rand.randomf(.5, 1.5));

			// this method allows setting more complex value generators. Let's make it move smoothly to the new value to demonstrate:
			ops.prop.updateScalarGen("/room/skyboxIntensity", {approach:{to:{constant:Rand.randomf(.5,1.5)}}});
		}
		// option 2:
		else
		{
			cav.view.roomView(ops).skyboxIntensity = Rand.randomf(.5, 1.5);
		}
	});




// Next, we're going to create an intersection test, which will set the test boolean to true when any user walks into a preset area
// It will also set it to false when no users remain in the area. 
// This trigger will not be synced, because all users will be running the script and will produce the same results.
// Why not sync the trigger? Because we don't need to and because extra syncs take more network traffic and journal size.

// declare a hidden, local, boolean to remember if we locally think there's a user in the area
// why not just a local variable instead of a property? Because we want to enable and disable the triggers based on its value, and local variables aren't watchable. (see 'activeWhileExpr' on line 51, 61)
cav.prop.declareBooleanProperty("userInArea", {default:false, meta:{base:{name:"UserInArea",description:""}}});

const detectionarea : Shape = Sphere.new({x:0,y:1,z:6},5);

let ops = cav.beginLocalOperations(); // build an ops object to make changes. These changes are local only so there's no commit or cancel needed.

cav.on({synced:false,activeWhileExpr:"!ref('userInArea')"})
	.intersection({mode:'anyintersection',distanceModifier:0}, 
		cav.view.users(), undefined, // the 'left' side of the intersection test, which represents all users (even ones that join later), with no overriding shape (so it uses their avatar bounding box)
		undefined, detectionarea // the 'right' side of the test, just the detection area, not relative to any object or user.
	)
	.then(v=>{
		ops.prop.updateBoolean("userInArea", true);
		ops.prop.updateBoolean("/room/testBoolean", true);
	});

cav.on({synced:false,activeWhileExpr:"ref('userInArea')"})
	.intersection({mode:'nointersections',distanceModifier:-2},  // less distance modifier to make the area bigger, to avoid flipflopping.
		cav.view.users(), undefined,
		undefined, detectionarea
	)
	.then(v=>{
		ops.prop.updateBoolean("userInArea", false);
		ops.prop.updateBoolean("/room/testBoolean", false);
	});