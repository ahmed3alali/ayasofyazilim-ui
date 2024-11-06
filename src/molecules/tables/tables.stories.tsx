/* eslint-disable no-alert */
import { Meta, StoryObj } from '@storybook/react';

import { useState } from 'react';
import { AutoFormProps } from 'src/organisms/auto-form';
import { z } from 'zod';
import jsonToCsv from '../../lib/json-to-csv';
import Table, { AutoColumnGenerator, TableAction } from '.';
import {
  columns,
  columnsEditable,
  columnsSubContent,
  renderSubComponent,
} from './columns';
import { data, Payment } from './data';

const formSchema = z.object({
  username: z
    .string({
      required_error: 'Username is required.',
    })
    .min(2, {
      message: 'Username must be at least 2 characters.',
    }),

  password: z
    .string({
      required_error: 'Password is required.',
    })
    .describe('Your secure password')
    .min(8, {
      message: 'Password must be at least 8 characters.',
    }),
});

const autoFormArgs: AutoFormProps = {
  formSchema,
  fieldConfig: {
    password: {
      inputProps: {
        type: 'password',
        placeholder: '••••',
        className: 'w-[10px]',
      },
    },
  },
  children: <div>Extra data</div>,
};

const action: TableAction = {
  cta: 'New Record',
  type: 'Dialog',
  description: 'Add New Record',
  componentType: 'Autoform',
  callback: () => alert('Added'),
  autoFormArgs,
};

/**
 * # Table stories
 * Awesome datatable that provides a lot of features.
 *
 * like: custom data tables, custom columsn, auto generated columns, etc
 */
export default { component: Table } as Meta<typeof Table>;

export const Default: StoryObj<typeof Table> = {
  args: {
    data,
    columnsData: {
      type: 'Custom',
      data: { columns },
    },
    action,
  },
  parameters: {
    layout: 'centered',
  },
};

// Status	Email	Amount
const jsonSchema: any = {
  type: 'object',
  required: ['status', 'email', 'amount'],
  properties: {
    status: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    amount: {
      type: 'number',
    },
    date: {
      type: 'string',
    },
    isActive: {
      type: 'boolean',
    },
  },
};

export const AutoColumns: StoryObj<typeof Table> = {
  args: {
    data,
    columnsData: {
      type: 'Auto',
      data: {
        selectable: true,
        onSelect(row) {
          console.log(row);
        },
        tableType: jsonSchema,
        excludeList: ['id'],
      },
    },
    action,
  },
  parameters: {
    layout: 'centered',
  },
};
export const autoColumnData: AutoColumnGenerator = {
  tableType: jsonSchema,
  excludeList: ['id'],
  selectable: false,
};

export const NewPage: StoryObj<typeof Table> = {
  args: {
    data,
    columnsData: {
      type: 'Auto',
      data: autoColumnData,
    },
    action: {
      cta: 'New Record',
      type: 'NewPage',
      href: '/new-page',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export const Sheet: StoryObj<typeof Table> = {
  args: {
    data,
    columnsData: {
      type: 'Auto',
      data: {
        tableType: jsonSchema,
        excludeList: ['id'],
      },
    },
    action: {
      cta: 'New Record',
      description: 'Add New Record',
      callback: () => alert('Added'),
      componentType: 'Autoform',
      autoFormArgs,
      type: 'Sheet',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export const MultipleActions: StoryObj<typeof Table> = {
  args: {
    data,
    columnsData: {
      type: 'Auto',
      data: {
        tableType: jsonSchema,
        excludeList: ['id'],
      },
    },
    action: [
      {
        cta: 'New Record sheet',
        description: 'Add New Record',
        callback: () => alert('Added'),
        autoFormArgs,
        componentType: 'Autoform',
        type: 'Sheet',
      },
      {
        cta: 'New Dialog',
        description: 'Add New Record',
        callback: () => alert('Added'),
        componentType: 'Autoform',
        autoFormArgs,
        type: 'Dialog',
      },
      {
        cta: 'New New Page',
        type: 'NewPage',
        href: '/new-page',
      },
      {
        type: 'Action',
        cta: `Export CSV`,
        callback: () => {
          jsonToCsv(data, 'export_data');
        },
      },
    ],
  },
  parameters: {
    layout: 'centered',
  },
};
const filedstable = { name: '', price: '' };
export const Editable: StoryObj<typeof Table> = {
  args: {
    editable: true,
    data,
    columnsData: {
      type: 'Custom',
      data: { columns: columnsEditable },
    },
    showView: false,
    Headertable: filedstable,
  },
  parameters: {
    layout: 'centered',
  },
};

export const SubContent: StoryObj<typeof Table> = {
  args: {
    editable: false,
    data,
    columnsData: {
      type: 'Custom',
      data: { columns: columnsSubContent },
    },
    showView: false,
    renderSubComponent,
  },
  parameters: {
    layout: 'centered',
  },
};
export const DetailedFilter: StoryObj<typeof Table> = {
  render: (args) => {
    const [tableData, setTableData] = useState(data);
    return (
      <Table
        {...args}
        data={tableData}
        fetchRequest={(page: any, filter: any) =>
          args.fetchRequest(filter, setTableData)
        }
      />
    );
  },
  args: {
    fetchRequest: (
      filter: Record<string, string>,
      setTableData: (data: unknown[]) => any
    ) => {
      const parsedFilter = filter;
      if (Object.keys(parsedFilter).length === 0) {
        setTableData(data);
      }
      Object.keys(parsedFilter).forEach((filterKey) => {
        if (parsedFilter[filterKey] === '') delete parsedFilter[filterKey];
      });
      Object.keys(parsedFilter).forEach((filterKey) => {
        const filteredData = data?.filter((tableItem) => {
          if (filterKey === 'isActive') {
            return tableItem.isActive.toString() === parsedFilter[filterKey];
          }
          if (filterKey === 'date') {
            return (
              new Date(tableItem.date || '').getTime() <
              new Date(parsedFilter[filterKey]).getTime()
            );
          }
          if (filterKey === 'email') {
            return tableItem.email.includes(parsedFilter[filterKey]);
          }
          if (filterKey === 'status') {
            return tableItem.status === parsedFilter[filterKey];
          }
          if (filterKey === 'status_multiple') {
            return parsedFilter[filterKey].includes(tableItem.status);
          }
          if (filterKey === 'select-async') {
            return parsedFilter[filterKey].includes(tableItem.id);
          }
          return true;
        });
        setTableData(filteredData);
      });
    },
    editable: false,
    data,
    columnsData: {
      type: 'Auto',
      data: autoColumnData,
    },
    showView: false,
    detailedFilter: [
      {
        name: 'email',
        displayName: 'Email',
        type: 'string',
        value: '',
      },
      {
        name: 'isActive',
        displayName: 'Is Active',
        placeholder: 'Filter by is active',
        type: 'boolean',
        value: '',
      },
      {
        name: 'status',
        displayName: 'Status',
        placeholder: 'Filter by status',
        type: 'select',
        value: '',
        options: [
          { label: 'pending', value: 'pending' },
          { label: 'processing', value: 'processing' },
          { label: 'success', value: 'success' },
          { label: 'failed', value: 'failed' },
        ],
      },
      {
        name: 'date',
        displayName: 'Date Less than',
        type: 'date',
        value: new Date().toISOString(),
      },
      {
        name: 'select-async',
        type: 'select-async',
        displayName: 'select-async',
        value: '',
        filterProperty: 'id',
        showProperty: 'email',
        columnDataType: autoColumnData,
        data,
        rowCount: 10,
      },
      {
        name: 'status_multiple',
        displayName: 'Status Multiple',
        type: 'select-multiple',
        value: 'failed',
        multiSelectProps: {
          options: [
            { label: 'pending', value: 'pending' },
            { label: 'processing', value: 'processing' },
            { label: 'success', value: 'success' },
            { label: 'failed', value: 'failed' },
          ],
          placeholder: 'Select frameworks',
          variant: 'inverted',
          animation: 0,
          maxCount: 3,
          modalPopover: false,
          // onValueChange: (value) => console.log(value),
        },
      },
    ],
  },
  parameters: {
    layout: 'centered',
  },
};

const subContentDialogAction: TableAction = {
  cta: 'New Dialog',
  type: 'Dialog',
  description: 'Add New Record',
  loadingContent: <div>Loading...</div>,
  componentType: 'CustomComponent',
  content: <>Data</>,
  callback: async () => <div>Content</div>,
};
export const SubContentDialog: StoryObj<typeof Table> = {
  args: {
    data,
    columnsData: {
      type: 'Custom',
      data: { columns },
    },
    action: subContentDialogAction,
  },
  parameters: {
    layout: 'centered',
  },
};

export const SubContentMenuActionDialog: StoryObj<typeof Table> = {
  render: (args) => <Table {...args} data={data} />,
  args: {
    editable: false,
    data,
    columnsData: {
      type: 'Auto',
      data: {
        ...autoColumnData,
        actionList: [
          {
            type: 'Dialog',
            loadingContent: <div className="text-center">Loading...</div>,
            description: 'Change History',
            componentType: 'CustomComponent',
            cta: 'Change History',
            callback: async () => <div className="text-center">No changes</div>,
          },
          {
            type: 'Dialog',
            cta: 'View Details',
            componentType: 'ConfirmationDialog',
            description: 'View Details description',
            variant: 'destructive',
            // callback: async (triggerData: Payment) => console.log(triggerData),
          },
          {
            type: 'Dialog',
            cta: 'Delete Email',
            componentType: 'ConfirmationDialog',
            description: (triggerData) => {
              const _triggerData = triggerData as Payment;
              return `Are you sure to delete ${_triggerData.email}?`;
            },
            variant: 'destructive',
            // callback: async (triggerData: Payment) => console.log(triggerData),
          },
        ],
      },
    },

    showView: false,
  },
  parameters: {
    layout: 'centered',
  },
};
