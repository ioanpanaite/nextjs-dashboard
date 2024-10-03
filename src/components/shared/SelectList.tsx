import { Listbox, Transition } from "@headlessui/react"
import classNames from "classnames"
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Fragment } from "react"

interface Item {
  id?: string | number;
  name: string;
  value?: string;
  img?: string;
  code?: string;
}

interface SelectListProps {
  title: string;
  items: Item[];
  selected: Item;
  setSelected: any;
}

export default function SelectList({
  title,
  items,
  selected,
  setSelected
}: SelectListProps) {

  return (
    <>
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <>
            <Listbox.Label className="block text-lg leading-6 text-gray-light">{title}</Listbox.Label>
            <div className="relative mt-2">
              <Listbox.Button className="relative w-full cursor-default rounded-md bg-lightGray py-1.5 pl-3 pr-10 text-left text-gray-light shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                <span className="flex items-center">
                  {selected?.img && <img src={selected.img} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" />}
                  <span className="ml-3 block truncate">{selected.name}</span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-lightGray py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {items.map((item: Item) => (
                    <Listbox.Option
                      key={item.name}
                      className={({ active }) =>
                        classNames(
                          active ? 'bg-gray-light text-gray-dark' : 'text-gray-light',
                          'relative cursor-default select-none py-2 pl-3 pr-9'
                        )
                      }
                      value={item}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center">
                            {item.img && <img src={item.img} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" />}
                            <span
                              className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                            >
                              {item.name}
                            </span>
                          </div>

                          {selected ? (
                            <span
                              className={classNames(
                                active ? 'text-green' : 'text-blue',
                                'absolute inset-y-0 right-0 flex items-center pr-4'
                              )}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </>
  )
}