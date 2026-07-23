import type { ImageSourcePropType } from 'react-native';

import type {
  AnimatedEmployeeId,
  EmployeePose,
  Facing,
} from './officeBehaviorModel';

type WalkFacing = Exclude<Facing, 'west'>;
type CarriedState = 'empty' | 'folder';
type FramePair = readonly [ImageSourcePropType, ImageSourcePropType];

const seatedSources: Record<
  AnimatedEmployeeId,
  { idle: ImageSourcePropType; reviewing: ImageSourcePropType }
> = {
  strategy: {
    idle: require('../assets/office/employee-strategy-seated-rig-v3.png'),
    reviewing: require('../assets/office/employee-strategy-seated-rig-v3.png'),
  },
  reviewer: {
    idle: require('../assets/office/employee-reviewer-seated-idle-rig-v3.png'),
    reviewing: require('../assets/office/employee-reviewer-seated-review-rig-v3.png'),
  },
};

const risingSources: Record<
  AnimatedEmployeeId,
  Record<CarriedState, ImageSourcePropType>
> = {
  strategy: {
    empty: require('../assets/office/employee-strategy-rising-empty-rig-v3.png'),
    folder: require('../assets/office/employee-strategy-rising-folder-rig-v3.png'),
  },
  reviewer: {
    empty: require('../assets/office/employee-reviewer-rising-empty-rig-v3.png'),
    folder: require('../assets/office/employee-reviewer-rising-folder-rig-v3.png'),
  },
};

const handoffSources: Record<AnimatedEmployeeId, ImageSourcePropType> = {
  strategy: require('../assets/office/employee-strategy.png'),
  reviewer: require('../assets/office/employee-reviewer.png'),
};

const walkSources: Record<
  AnimatedEmployeeId,
  Record<CarriedState, Record<WalkFacing, FramePair>>
> = {
  strategy: {
    empty: {
      north: [
        require('../assets/office/employee-strategy-empty-north-a-rig-v3.png'),
        require('../assets/office/employee-strategy-empty-north-b-rig-v3.png'),
      ],
      south: [
        require('../assets/office/employee-strategy-empty-south-a-rig-v3.png'),
        require('../assets/office/employee-strategy-empty-south-b-rig-v3.png'),
      ],
      east: [
        require('../assets/office/employee-strategy-empty-east-a-rig-v3.png'),
        require('../assets/office/employee-strategy-empty-east-b-rig-v3.png'),
      ],
    },
    folder: {
      north: [
        require('../assets/office/employee-strategy-folder-north-a-rig-v3.png'),
        require('../assets/office/employee-strategy-folder-north-b-rig-v3.png'),
      ],
      south: [
        require('../assets/office/employee-strategy-folder-south-a-rig-v3.png'),
        require('../assets/office/employee-strategy-folder-south-b-rig-v3.png'),
      ],
      east: [
        require('../assets/office/employee-strategy-folder-east-a-rig-v3.png'),
        require('../assets/office/employee-strategy-folder-east-b-rig-v3.png'),
      ],
    },
  },
  reviewer: {
    empty: {
      north: [
        require('../assets/office/employee-reviewer-empty-north-a-rig-v3.png'),
        require('../assets/office/employee-reviewer-empty-north-b-rig-v3.png'),
      ],
      south: [
        require('../assets/office/employee-reviewer-empty-south-a-rig-v3.png'),
        require('../assets/office/employee-reviewer-empty-south-b-rig-v3.png'),
      ],
      east: [
        require('../assets/office/employee-reviewer-empty-east-a-rig-v3.png'),
        require('../assets/office/employee-reviewer-empty-east-b-rig-v3.png'),
      ],
    },
    folder: {
      north: [
        require('../assets/office/employee-reviewer-folder-north-a-rig-v3.png'),
        require('../assets/office/employee-reviewer-folder-north-b-rig-v3.png'),
      ],
      south: [
        require('../assets/office/employee-reviewer-folder-south-a-rig-v3.png'),
        require('../assets/office/employee-reviewer-folder-south-b-rig-v3.png'),
      ],
      east: [
        require('../assets/office/employee-reviewer-folder-east-a-rig-v3.png'),
        require('../assets/office/employee-reviewer-folder-east-b-rig-v3.png'),
      ],
    },
  },
};

export function getEmployeePoseFrames(
  employeeId: AnimatedEmployeeId,
  pose: EmployeePose,
  facing: Facing,
) {
  if (pose === 'seatedIdle' || pose === 'seatedReviewing') {
    const source =
      pose === 'seatedReviewing'
        ? seatedSources[employeeId].reviewing
        : seatedSources[employeeId].idle;
    return { first: source, mirror: 1 };
  }

  if (pose === 'handoff') {
    const baseFacing = employeeId === 'strategy' ? 'east' : 'west';
    return {
      first: handoffSources[employeeId],
      mirror: baseFacing === facing ? 1 : -1,
    };
  }

  if (pose === 'risingEmpty' || pose === 'risingWithFolder') {
    return {
      first:
        risingSources[employeeId][
          pose === 'risingWithFolder' ? 'folder' : 'empty'
        ],
      mirror: 1,
    };
  }

  const carriedState: CarriedState =
    pose === 'standingWithFolder' || pose === 'walkWithFolder'
      ? 'folder'
      : 'empty';
  const sourceFacing = facing === 'west' ? 'east' : facing;
  const [first, second] = walkSources[employeeId][carriedState][sourceFacing];

  return {
    first,
    mirror: facing === 'west' ? -1 : 1,
    second,
  };
}
