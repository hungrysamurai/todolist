import { SortableEvent } from "sortablejs";

interface PointerEventWithLayerProps extends PointerEvent {
 layerX: number,
 layerY: number
}

export interface SortableEventWithOriginalProp extends SortableEvent {
 originalEvent: PointerEventWithLayerProps;
}