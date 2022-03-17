import logo from './logo.svg';
import styles from './App.module.css';
import { createSignal, createResource, For, Show, Suspense } from 'solid-js';

function App() {
  async function fetchData(slug) {
    const html = await (await fetch(`https://unpkg.com/browse/solid-js${slug}`)).text();
    return JSON.parse(html.split('<script>window.__DATA__ = ').pop().split('</script>')[0]);
  }
  function handleSelect(event) {
    setVersionId(event.target.value);
  }
  const [versionId, setVersionId] = createSignal();
  const [availableVersions] = createResource(async () => {
    return (await fetchData('/dist/')).availableVersions;
  });
  const [distData] = createResource(versionId, async (versionId) => {
    return (await fetchData(`@${versionId}/dist/`)).target.details;
  });

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
      </header>

      <section class={styles.main}>
        <select onInput={handleSelect}>
          <For each={availableVersions()}>
            {(item) => <option value={item}>{item}</option>}
          </For>
        </select>
        <Suspense fallback={<p>loading...</p>}>
          <Show when={distData()}>
            <For each={Object.values(distData())}>
              {(item) => <p>{item.path} {item.size}</p>}
            </For>
          </Show>
        </Suspense>
      </section>
    </div>
  );
}

export default App;
