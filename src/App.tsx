import { For, Match, type Setter, Show, Switch } from "solid-js";
import { produce } from "solid-js/store";
import "./App.scss";

import { initShortcuts } from "./keyboard";
import { initLeaveAlert } from "./leave";

import {
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
} from "./signals";

initShortcuts();
initLeaveAlert();

function App() {
  return (
    <>
      <ControlArea />
      <EditArea />
      <PreviewArea />
    </>
  );
}

export default App;

const re = {
  Parameter: /\\?\{{2}\.((?:[a-zA-Z][_.]*\d*)+?)\}{2}/gm,
};

function updateTemplate(e: InputEvent) {
  const element = e?.currentTarget as HTMLTextAreaElement;
  setTemplate(element.value);
  const matches = element.value.matchAll(re.Parameter);
  setParams((prev) => {
    const next = prev
      .filter((p) => p.value !== "")
      .map((p) => ({ ...p, isVisible: false }));
    for (const [value, key] of matches) {
      if (value.startsWith("\\")) continue;
      const element = next.find((p) => p.key === key.toLowerCase());
      if (!element) {
        next.push({ key: key.toLowerCase(), value: "", isVisible: true });
      } else {
        element.isVisible = true;
      }
    }
    return next;
  });
  updatePreview();
}

function updatePreview() {
  setPreview(() => {
    let next = template();
    const matches = template().matchAll(re.Parameter);
    for (const [value, key] of matches) {
      if (value[0].startsWith("\\")) continue;
      next = next.replace(
        value,
        params.find((p) => p.key === key.toLowerCase())?.value || ""
      );
    }
    return next;
  });
}

function updateParams(key: string) {
  return (e: InputEvent) => {
    const element = e?.currentTarget as HTMLInputElement;
    const value = element.value;
    setParams(
      produce((prev) => {
        const element = prev.find((p) => p.key === key);
        if (!element) return;
        element.value = value;
      })
    );
    updatePreview();
  };
}

function ControlArea() {
  return (
    <div class={"control-area"}>
      <input type="button" value="Save" tabIndex={-1} />
    </div>
  );
}

function EditParameter({ key, value }: { key: string; value: string }) {
  const isVisible = Array.from(params).find((p) => p.key === key)?.isVisible;
  const deleteItem = () => {
    setParams(
      produce((prev) => {
        const element = prev.find((p) => p.key === key);
        if (!element) return;
        prev.splice(prev.indexOf(element), 1);
      })
    );
    updatePreview();
  };
  return (
    <li>
      <label>
        {key}:
        <input
          name={key}
          placeholder={key}
          value={value}
          tabindex="201"
          onInput={updateParams(key)}
        />
        <input
          type="button"
          tabindex="201"
          disabled={isVisible}
          onClick={deleteItem}
          value="Trash"
        />
      </label>
    </li>
  );
}

function updateCheckBox(set: Setter<boolean>) {
  return (e: Event) => {
    const element = e?.currentTarget as HTMLInputElement;
    set(element.checked);
  };
}

function EditArea() {
  return (
    <div class={"edit-area"}>
      <EditTextArea />
      <ParametersArea />
    </div>
  );
}

function EditTextArea() {
  return (
    <textarea
      class={"text-area"}
      value={template()}
      tabindex="1"
      autofocus
      onInput={updateTemplate}
    />
  );
}

function ParametersArea() {
  return (
    <div class={"parameters-area"}>
      <h2>Parameters</h2>
      <label>
        <input
          type="checkbox"
          tabindex="200"
          onChange={updateCheckBox(setShowHiddenParameters)}
        />
        Show All Parameters
      </label>
      <ul>
        <For each={params}>
          {(item) => (
            <Show when={item.isVisible || showHiddenParameters()}>
              <li>
                <EditParameter key={item.key} value={item.value} />
              </li>
            </Show>
          )}
        </For>
      </ul>
    </div>
  );
}

function PreviewArea() {
  return (
    <div class={"preview-area"}>
      <h2>Preview</h2>
      <label>
        <input
          type="checkbox"
          tabindex={300}
          onChange={updateCheckBox(setUseHTML)}
        />
        Use HTML
      </label>
      <Switch>
        <Match when={useHTML()}>
          <div innerHTML={preview()} />
        </Match>
        <Match when={!useHTML()}>
          <div>
            <pre>{preview()}</pre>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
