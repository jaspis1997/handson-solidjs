import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import type { Parameters } from "./types";

const [template, setTemplate] = createSignal("");
const [params, setParams] = createStore<Parameters[]>([]);
const [preview, setPreview] = createSignal("");
const [useHTML, setUseHTML] = createSignal(false);
const [showHiddenParameters, setShowHiddenParameters] = createSignal(false);

export {
	params,
	preview,
	setParams,
	setPreview,
	setShowHiddenParameters,
	setTemplate,
	setUseHTML,
	showHiddenParameters,
	template,
	useHTML,
};
