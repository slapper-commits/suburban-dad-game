import { choreography } from '../SceneChoreography';

const GROUND_Y = 337;

/**
 * All dynamic scene beats live here so adding new ones is a single-file edit.
 *
 * Beat convention:
 *  - `persistFlag` lives on state.flags and becomes the "this happened" marker
 *    visible to ALL systems (renderers, dialogues, conditions).
 *  - `trigger` reads state.flags or other state — typically a "close dealt"
 *    or "first-time condition" flag set by a dialogue/minigame effect.
 *  - Actor dictionaries in `initial` should cover every visual the beat
 *    animates. Renderers should hide the corresponding static sprite while
 *    the beat is active and also after it completes (if the world changed).
 */

let registered = false;
export function registerAllBeats(): void {
  if (registered) return;
  registered = true;

  // ──────────────────────────────────────────────────────────
  // Fence Guy hops in his Buick and drives off after the deal
  // ──────────────────────────────────────────────────────────
  // Timeline (duration = 5s):
  //   0.00–1.60s : fence walks right toward the parked Buick
  //   1.60–2.00s : fence "enters" the car (hidden = true)
  //   2.00–5.00s : Buick drives off to the right, exits the frame
  // After completion: flags.fence_left_alley = true. Renderer stops drawing
  // both the fence and the Buick when this flag is set.
  choreography.register({
    id: 'fence_leaves',
    sceneId: 'sketchy',
    persistFlag: 'fence_left_alley',
    trigger: (state) => state.flags.fenceDealClosed === true,
    duration: 5.0,
    initial: () => ({
      fence: { x: 300, y: GROUND_Y, hidden: false, pose: 'idle' },
      buick: { x: 230, y: GROUND_Y, hidden: false, pose: 'parked' },
    }),
    update: (t, actors) => {
      if (t < 0.32) {
        // Phase 1 — walk to the car
        const p = t / 0.32;
        actors.fence.x = 300 - p * 55;
        actors.fence.pose = 'walking';
      } else if (t < 0.40) {
        // Phase 2 — enter the car
        actors.fence.hidden = true;
        actors.fence.pose = 'in_car';
      } else {
        // Phase 3 — drive off to the right
        const p = (t - 0.40) / 0.60;
        // Eased acceleration
        const e = p * p;
        actors.buick.x = 230 + e * 700;
        actors.buick.pose = 'driving';
        actors.fence.hidden = true;
      }
    },
    // No extra state work on completion — the persist flag does the job.
  });

  // Future beats go here. Examples worth adding later:
  //   - delivery_truck_arrives (BBQ)
  //   - taco_vendor_restocks  (motel_exterior)
  //   - cop_drives_by         (sidewalk, if suspicion high)
}
