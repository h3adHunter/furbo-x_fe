import { Mesh } from 'three';
import { PlayerProps } from './';

export default interface SphereProps {
  ref: React.RefObject<Mesh>;
  player: PlayerProps;
}