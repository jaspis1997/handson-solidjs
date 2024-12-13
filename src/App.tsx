import { For, Match, type Setter, Show, Switch, createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";
import "./App.scss";

type Parameters = {
  key: string;
  value: string;
  isVisible: boolean;
};

const re = {
  Parameter: /\{{2}(.+?)\}{2}/g,
};
const [template, setTemplate] = createSignal("");
const [params, setParams] = createStore<Parameters[]>([]);
const [preview, setPreview] = createSignal("");
const [useHTML, setUseHTML] = createSignal(false);
const [showAllParameters, setShowAllParameters] = createSignal(false);

function updateTemplate(e: InputEvent) {
  const element = e?.currentTarget as HTMLTextAreaElement;
  setTemplate(element.value);
  const matches = element.value.matchAll(re.Parameter);
  setParams((prev) => {
    const next = prev
      .filter((p) => p.value !== "")
      .map((p) => ({ ...p, isVisible: false }));
    for (const match of matches) {
      const key = match[1].toLowerCase();
      const element = next.find((p) => p.key === key);
      if (!element) {
        next.push({ key, value: "", isVisible: true });
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
          onInput={updateParams(key)}
        />
        <input
          type="button"
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

function App() {
  return (
    <>
      <div class={"control-area"}>
        <input type="button" value="Save" />
      </div>
      <div class={"edit-area"}>
        <textarea
          class={"text-area"}
          value={template()}
          onInput={updateTemplate}
        />
        <div class={"parameters-area"}>
          <h2>Parameters</h2>
          <label>
            <input
              type="checkbox"
              onChange={updateCheckBox(setShowAllParameters)}
            />
            Show All Parameters
          </label>
          <ul>
            <For each={params}>
              {(item) => (
                <Show when={item.isVisible || showAllParameters()}>
                  <li>
                    <EditParameter key={item.key} value={item.value} />
                  </li>
                </Show>
              )}
            </For>
          </ul>
        </div>
      </div>
      <div>
        <h2>Preview</h2>
        <label>
          <input type="checkbox" onChange={updateCheckBox(setUseHTML)} />
          Use HTML
        </label>
        <Switch>
          <Match when={useHTML()}>
            <div class={"preview-area"} innerHTML={preview()} />
          </Match>
          <Match when={!useHTML()}>
            <div class={"preview-area"}>
              <pre>{preview()}</pre>
            </div>
          </Match>
        </Switch>
      </div>
    </>
  );
}

export default App;
