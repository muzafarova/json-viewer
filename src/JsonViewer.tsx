import React from 'react';
import styles from './JsonViewer.css?inline';
import { TreeNode } from './TreeNode.js';
import { findNextVisibleListItem, findPrevVisibleListItem, clickOn, isInViewport } from './dom.js';

type JsonViewerProps = {
    value?: string;
    children: string|string[];
}

export function JsonViewer({ value: val, children }: JsonViewerProps) {
    const [selectedNode, setSelectedNode] = React.useState('');
    const ref = React.useRef<HTMLDivElement>(null);
    let value;

    React.useEffect(() => {
        const { current } = ref;
        if (!current) {
            return;
        }

        current.addEventListener('keydown', onKeyDownHandler);

        return () => current.removeEventListener('keydown', onKeyDownHandler);

        function onKeyDownHandler(e: KeyboardEvent) {
            if (e.altKey || e.metaKey || e.ctrlKey) {
                return;
            }

            if (!current) {
                return;
            }

            const selectedElement = current.querySelector(':scope li.selected');
            if (!selectedElement) {
                select(current.firstElementChild?.firstElementChild);
                return;
            }

            switch (e.code) {
                case 'ArrowLeft': {
                    e.preventDefault();
                    if (selectedElement.getAttribute('aria-expanded')) {
                        clickOn(selectedElement);
                    } else {
                        select(selectedElement.parentElement?.previousElementSibling);
                    }
                }
                break;
                case 'ArrowRight': {
                    e.preventDefault();
                    if (!selectedElement.getAttribute('aria-expanded')) {
                        clickOn(selectedElement);
                    }
                }
                break;
                case 'ArrowDown':
                case 'KeyJ': {
                    e.preventDefault();
                    select(findNextVisibleListItem(selectedElement));
                }
                break;
                case 'ArrowUp':
                case 'KeyK': {
                    e.preventDefault();
                    select(findPrevVisibleListItem(selectedElement));
                }
                break;
            }
        }


    });

    try {
      value = JSON.parse(val || (typeof children === 'string' ? children : children.join('')));
    } catch (e: unknown) {
      return <>
          <style>{styles}</style>
          <pre className="json-tree">JsonViewer: {(e as { message: string }).message}</pre>
        </>;
    }

    return (
        <>
            <style>{styles}</style>
            <div ref={ ref } className="json-tree">
                <ol className="expanded" role="tree" tabIndex={ 0 }>
                    <TreeNode lazy={ true } selected={ selectedNode } value={ value } key={ "root" } path="" onSelectedNode={ onSelectedNode } />
                </ol>
            </div>
        </>
    );

    function onSelectedNode(path: string) {
        setSelectedNode(path);
        const el = ref.current!.querySelector(`[json-path="${ path }"]`);
        if (el) {
            setTimeout(() => (el as HTMLElement).focus());
        }
    }

    function select(el?: Element|null) {
        if (el) {
            const path = el.getAttribute('json-path');
            if (path !== null) {
                setSelectedNode(path);
                setTimeout(() => (el as HTMLElement).focus());
                if (el instanceof HTMLElement) {
                    if (!isInViewport(el)) {
                        el.scrollIntoView({ block: 'center' });
                    }
                }
            }
        }
    }

}

