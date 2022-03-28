import logo from './logo.svg';
import styles from './App.module.css';
import { createSignal, createResource, For, Show, Suspense } from 'solid-js';

function App() {
  async function fetchData(slug) {
    const html = await (await fetch(`https://unpkg.com/browse/solid-js${slug}`)).text();
    return JSON.parse(html.split('<script>window.__DATA__ = ').pop().split('</script>')[0]);
  }
  function handleSelect(event) {
    setVersionIds(Array.from(event.target.selectedOptions).map(v => v.value));
  }
  const [versionIds, setVersionIds] = createSignal();
  const [availableVersions] = createResource(async () => {
    return (await fetchData('/dist/')).availableVersions;
  });
  const [distData] = createResource(versionIds, async (versionIds) => {
    let result = [];
    for await (const data of versionIds.map(version => fetchData(`@${version}/dist/`))) {
      result.push({
        version: data.packageVersion,
        files: data.target.details,
      });
    }
    return result;
  });

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
      </header>

      <section class={styles.main}>
        <select onInput={handleSelect} multiple>
          <For each={availableVersions()}>
            {(item) => <option value={item}>{item}</option>}
          </For>
        </select>
        <Suspense fallback={<p>loading...</p>}>
          <Show when={distData()}>
            <table>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                <For each={distData()}>
                  {(item) => 
                    <tr>
                      <td>{item.version}</td>
                      <td>{item.files['/dist/solid.js'].size}</td>
                    </tr>
                  }
                </For>
              </tbody>
            </table>
          </Show>
        </Suspense>
      </section>
    </div>
  );
}

export default App;
