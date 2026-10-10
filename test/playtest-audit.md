# Gecko Escape 1 playtest design audit

This audit covers the five playable animals and the five character-specific opening habitats from the current production source. It is scoped to the test copy at `/test`. The shared game loop, art style, and working abilities remain in place.

## Movement pass

- **Chameleon:** Retained its bent, grasping gait, tucked airborne legs, and vertical body orientation. Added forgiving vine approach, deliberate jump-off from a climb, jump buffering, coyote time, grounded/air acceleration, and a species-specific ground speed.
- **Crested gecko:** Kept its existing adhesive-foot animation and vertical/ceiling routes. Added jump buffering, coyote time, easier vine entry/exit, and arboreal handling.
- **Fire-belly newt:** Kept its current appearance. Reduced land speed from 128 to 108 and swim speed from 170 to 148, softened acceleration, and added jump buffering/coyote time.
- **Azureus dart frog:** Preserved the power-leap and tongue abilities. Tuned horizontal speed/acceleration, air control, jump buffering, and landing responsiveness so horizontal input does not feel like a separate movement system.
- **Black Colombian boa:** Reduced ground speed to 158 and acceleration to 720 for more mass and momentum. Reworked constriction so the long trunk remains an S-curve while the neck makes the smaller targeted wrap around prey; the wrap follows prey height and does not appear when no prey is selected.
- **Shared route control:** A 10px vine approach tolerance, 145ms jump buffer, and 115ms coyote window improve entry, exit, and transfers between vertical routes without changing normal keyboard controls.

## Chameleon — The Screen Enclosure

1. The spawn started farther from the first branch than necessary → moved it to a clean first-ledge approach.
2. The early route had a 43px horizontal gap after the low branch → added a short branch step.
3. The next transition offered no intermediate landing → added a mid-height branch step.
4. The climb toward the upper limb had a long diagonal jump → added a raised branch landing.
5. The center route crossed a 60px gap → added a narrow connector.
6. The right-hand climb ended without a nearby descent step → added a right-side branch.
7. The final approach to the exit had no stepping surface → added an exit-side branch.
8. The new branch steps lacked a clear material cue → drew them as bark with leaf sprouts.
9. The added vertical route looked like a ledge jump → added a climbable branch at the upper crossing.
10. The canopy was the only high route → retained the canopy and added a parallel branch route.
11. Only five crickets spread the objective thinly across the full enclosure → placed five more along the new branch route.
12. Some new prey sat between platforms → aligned the additions with the new branch landings.
13. The moving hand hazard crossed too much of the center route → shortened its patrol interval.
14. The hand patrol was fast for a first habitat → reduced its speed from 82 to 72.
15. A mistimed landing could cancel a jump → added buffered jumping.
16. Leaving a ledge could make a jump impossible → added a short coyote window.
17. Vine attachment required direct overlap → added a small approach tolerance.
18. Jumping while climbing could immediately reattach → added a short climb-release window and directional launch.
19. Air movement used the same strong acceleration as ground travel → softened air control.
20. The chameleon shared generic ground pace → tuned its land speed and acceleration for precise branch travel.

## Crested gecko — The Arboreal Terrarium

1. The first route opened onto a 274px central gap → filled it with two cork steps.
2. The first mid-level landing was isolated → added a lower cork connector.
3. The next climb had no stepping point → added a second cork landing.
4. The vertical branch did not meet the new route → added a climbable branch beside the connector.
5. The far side of the central gap lacked a safe landing → widened the bridge with a short step.
6. The rise to the next shelf was a single large jump → added a smaller intermediate landing.
7. The upper route had a 27px break between vine and shelf → added an upper cork step.
8. The descent path had no short transition → connected the existing shelf to the central vine with a step.
9. New route pieces had no cork identity → rendered the new steps with cork texture.
10. The upper canopy remained visually separate from the lower route → added a climbable connector toward it.
11. The prey route skipped the new middle path → added prey on its bridge and upper step.
12. Collectibles were concentrated on the original platforms → distributed new prey along both route choices.
13. The hand hazard moved quickly across the starting floor → reduced its speed from 82 to 72.
14. Its patrol span crossed the route at every height → narrowed its interval.
15. Climb entry required exact overlap → added the shared vine approach tolerance.
16. Jumping away from a climb could feel sticky → added a short directional release.
17. A late jump input could miss the landing → added jump buffering.
18. Leaving a ledge removed jump access too quickly → added coyote time.
19. Air acceleration was too strong for a sticky climber → softened airborne control.
20. Ground movement did not distinguish the gecko from the other small reptiles → tuned crested-gecko land speed and acceleration.

## Fire-belly newt — The Paludarium

1. The spawn overlapped the first platform vertically → raised it to sit cleanly on the shoreline ledge.
2. The water-to-stone transition had no first stepping stone → added a shore stone.
3. The first above-water crossing had a gap → added an intermediate stone.
4. The route from the stone to the upper shelf had no landing → added a connector stone.
5. The right side lacked a low return route → added a shore-level platform.
6. The climb route started well above the stepping stones → added a lower vertical vine.
7. The rightmost route offered one climb line → kept its original vine and added a second connection.
8. New stones had no visual distinction from wood platforms → rendered them as mossy stone.
9. The water exit route was visually hard to read → aligned the new stones to form a visible shoreline path.
10. The surface approach was too abrupt → added a stepped sequence at the waterline.
11. Several worms were isolated from the shoreline route → added prey along the stone path.
12. Upper prey lacked a nearby landing → added a stone below the upper route.
13. A worm was far from the right-hand return → placed prey on the lower-right stone.
14. The hand patrol was fast for the slower newt → reduced speed from 76 to 68.
15. The patrol interval was wide across the water exit → narrowed its range.
16. The newt started too close to the predator's horizontal lane → shifted the patrol farther right.
17. Land movement was too fast for its deliberate gait → reduced speed from 128 to 108.
18. Swim movement was disproportionately fast → reduced speed from 170 to 148.
19. A missed jump could leave it below the shore ledge → added buffering and coyote time.
20. A climb jump could reattach before clearing a route → added a short release window.

## Azureus dart frog — The Planted Vivarium

1. The spawn nearly overlapped its first leaf → aligned it to the leaf top.
2. The lower-to-middle path had a 35px gap → added a broad leaf bridge.
3. The middle route had a long vertical jump → added a raised leaf step.
4. The upper-left flower platform had no approach → added a connector leaf.
5. The center-right transition had a broad gap → added a short leaf landing.
6. The right shelf had no stepping route → added a bridge below it.
7. The upper-right flower route had an awkward rise → added a small leaf step.
8. New platforms had no leaf silhouette → rendered them as curved leaves with a visible central vein.
9. There was no safe intermediate landing after a power leap → added multiple mid-height landings.
10. The route overused long open jumps → added low and high route choices.
11. Prey ignored the new route → placed fruit flies on its new leaves.
12. The original prey cluster missed the center connector → added a reward there.
13. The final upper prey had no nearby resting point → added a leaf landing under it.
14. The hand hazard crossed the low route quickly → reduced speed from 84 to 70.
15. The hazard span crossed too much of the landing area → narrowed its interval.
16. The hazard’s broad collision box threatened small landings → reduced its size.
17. Horizontal ground travel was too fast between frog jumps → reduced land speed to 172.
18. Air steering was as forceful as ground steering → reduced acceleration and air control.
19. A jump just before landing could be lost → added buffered jumping.
20. A jump just after leaving a leaf could be lost → added coyote time.

## Black Colombian boa — The Boa Enclosure

1. The boa’s wide body began partly inside its first ledge → raised its spawn to a clean platform-top position.
2. The opening route jumped directly between distant logs → added a low log step.
3. The center route had no intermediate ledge → added a second log step.
4. The upper approach had a large gap → added a third log step.
5. The vertical climb did not meet the upper log route → added a climbable connector.
6. The existing tunnel was closed at one end → removed its blocking end wall so the snake can pass through.
7. The tunnel opening needed to remain visibly hollow → retained the visible interior between roof and floor.
8. The route had only one tunnel approach → kept both openings unobstructed.
9. The new log steps looked unlike cork bark → rendered them with bark grain and rounded ends.
10. The tunnel route did not have a nearby prey reward → placed a rat beside the tunnel approach.
11. The existing mouse route skipped the new center log → added a mouse there.
12. The large boa needed more deliberate traversal than a gecko → reduced land speed to 158.
13. Its acceleration stopped feeling heavy → reduced acceleration to 720.
14. Midair steering remained too sharp for its mass → reduced air control.
15. A missed platform jump could strand the long body → added jump buffering and coyote time.
16. Climbing required exact overlap → added forgiving vine entry.
17. Jumping from a vine could immediately reattach → added a directional climb release.
18. Constriction drew the whole body into a circle → restored the long S-shaped trunk and moved the wrap to the neck.
19. Constriction ignored whether prey was above or below → made the neck wrap track the prey's vertical offset.
20. Constriction could look active without a target → removed the wrap pose when no prey is selected.
